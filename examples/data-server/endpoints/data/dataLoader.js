/**
 * The example does not load data from a database,
 * this file helps out by reading from a json file and applying modifiers like:
 * - filters
 * - sorters
 */

    const express = require('express');
    const path = require('path');
    const fs = require('fs').promises;

// You should have a dotenv file with your AI API Key
    const debug = true; // Enable/disable debug logging

// read file
    async function readDataFile(file) {
        const filePath = path.join(__dirname, file);
        const raw = await fs.readFile(filePath, 'utf8');
        return JSON.parse(raw);
    }


    /**
     * PARSE METHODS
     */

        /**
         * Get sorting data
         * @param {*} sortParam 
         * @returns 
         */
        function parseSort(sortParam) {
            const s = safeParseJSON(sortParam);
            if (!s) return [];
            return Array.isArray(s) ? s : [s];
        }

        /**
         * Find filters
         * @param {*} filterParam 
         * @param {*} query 
         * @returns 
         */
        function parseFilters(filterParam, query) {
            const parsed = [];
            const f = safeParseJSON(filterParam);

            // Active filters
                if (Array.isArray(f)) {
                    f.forEach(item => {
                        const prop = item.property || item.field || item.name;
                        const value = item.value === undefined ? item.filter : item.value;
                        const operator = (item.operator || item.type || 'eq').toLowerCase();
                        parsed.push({ property: prop, value, operator });
                    });
                    return parsed;
                }

            // No filter fallback: simple query-string style filters (e.g. ?status=open)
                const blacklist = new Set(['_dc', 'page', 'start', 'limit', 'sort', 'filter', 'group' ]);
                Object.keys(query).forEach(k => {
                    if (!blacklist.has(k) && query[k] !== undefined && query[k] !== '') {
                    parsed.push({ property: k, value: query[k], operator: 'eq' });
                    }
                });

                return parsed;
            }


            /**
             * Safe parse json
             * @param {*} str 
             * @returns 
             */
            function safeParseJSON(str) {
                if (!str) return null;
                if (typeof str !== 'string') return str;
                try {
                    return JSON.parse(str);
                } catch (e) {
                    try {
                    return JSON.parse(decodeURIComponent(str));
                    } catch (e2) {
                    return null;
                    }
                }
            }

/**
 * APPLY FILTER + SORT
 */
        /**
         * APPLY FILTERS
         * @param {*} data 
         * @param {*} filters 
         * @returns 
         */
        function applyFilters(data, filters) {
            if (!filters || filters.length === 0) return data;

            return data.filter(row => {
                return filters.every(f => {
                    const prop = f.property;
                    const rawVal = f.value;
                    const op = (f.operator || 'eq').toLowerCase();

                    const cell = row[prop];
                    if (cell === undefined) return false;

                    // numeric compare if both are numeric
                    const numCell = Number(cell);
                    const numVal = Number(rawVal);
                    const bothNumbers = !Number.isNaN(numCell) && !Number.isNaN(numVal);

                    if (bothNumbers) {
                        if (op === 'gt') return numCell > numVal;
                        if (op === 'lt') return numCell < numVal;
                        if (op === 'gte') return numCell >= numVal;
                        if (op === 'lte') return numCell <= numVal;
                        if (op === 'ne') return numCell !== numVal;
                        /* IN FOR NUMBERS */
                            if (op === 'in') {
                                const arr = Array.isArray(rawVal)
                                    ? rawVal.map(Number)
                                    : String(rawVal).split(',').map(Number);
                                return arr.includes(numCell);
                            }
                            if (op === 'notin') {
                                const arr = Array.isArray(rawVal)
                                    ? rawVal.map(Number)
                                    : String(rawVal).split(',').map(Number);
                                return !arr.includes(numCell);
                            }
                        return numCell === numVal;
                    }

                    // string ops (case-insensitive)
                    const textCell = String(cell).toLowerCase();
                    const textVal = String(rawVal).toLowerCase();

                    if (op === 'like' || op === 'contains' || op === 'substring') {
                        return textCell.indexOf(textVal) !== -1;
                    }
                    if (op === 'startswith') return textCell.startsWith(textVal);
                    if (op === 'endswith') return textCell.endsWith(textVal);
                    if (op === 'ne') return textCell !== textVal;

                    /** IN FOR STRINGS */
                        if (op === 'in') {
                            const arr = Array.isArray(rawVal)
                                ? rawVal.map(v => String(v).toLowerCase())
                                : String(rawVal).split(',').map(v => v.trim().toLowerCase());
                            return arr.includes(textCell);
                        }

                        if (op === 'notin') {
                            const arr = Array.isArray(rawVal)
                                ? rawVal.map(v => String(v).toLowerCase())
                                : String(rawVal).split(',').map(v => v.trim().toLowerCase());
                            return !arr.includes(textCell);
                        }

                    // default equality
                    return textCell === textVal;
                });
            });
        }

        /**
         * Apply sorter
         * @param {*} data 
         * @param {*} sorters 
         * @returns 
         */
        function applySort(data, sorters) {
            if (!sorters || sorters.length === 0) return data;
            const arr = data.slice();
            arr.sort((a, b) => {
                for (const s of sorters) {
                const prop = s.property || s.field || s.name;
                const dir = (s.direction || s.order || 'ASC').toUpperCase();

                const va = a[prop], vb = b[prop];
                if (va == null && vb == null) continue;
                if (va == null) return dir === 'ASC' ? -1 : 1;
                if (vb == null) return dir === 'ASC' ? 1 : -1;

                const na = Number(va), nb = Number(vb);
                if (!Number.isNaN(na) && !Number.isNaN(nb)) {
                    if (na < nb) return dir === 'ASC' ? -1 : 1;
                    if (na > nb) return dir === 'ASC' ? 1 : -1;
                    continue;
                }

                const cmp = String(va).localeCompare(String(vb));
                if (cmp !== 0) return dir === 'ASC' ? cmp : -cmp;
                }
                return 0;
            });
            return arr;
        }

        /**
         * Load Data and apply modifiers
         * @param {*} req 
         * @param {*} dataFile 
         * @returns 
         */
        async function loadData(req,dataFile) {
            let res={
                success: false,
                data: null,
                count: 0,
                message: "",
            };
            try {
                const { start, limit } = req.query;

                const json = await readDataFile(dataFile);
                const all = Array.isArray(json.data) ? json.data : [];

                // FILTERS
                    const filters = parseFilters(req.query.filter, req.query);
                    let result = applyFilters(all, filters);
                    const total = result.length;
                // SORTERS
                    const sorters = parseSort(req.query.sort);
                    result = applySort(result, sorters);
                    

                const s = Number.isFinite(+start) ? parseInt(start, 10) : 0;
                const l = Number.isFinite(+limit) ? parseInt(limit, 10) : undefined;

                const sliced = !isNaN(s) && !isNaN(l) ? result.slice(s, s + l) : result;

                res = {
                    success: true,
                    data: sliced,
                    count: total,
                    message: "",
                };
            } catch (err) {
                console.error(err);
                res={
                    success: false,
                    data: null,
                    count: 0,
                    message: 'Failed to load data.json'
                };
            }
            return res;
        }

// Export this router to be used in the main Express app
module.exports = {
    loadData
};