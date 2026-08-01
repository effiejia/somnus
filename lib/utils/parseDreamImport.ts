export interface ParsedEntry {
	date: Date | null;
	body: string;
}

// Matches lines that are purely a date expression
const DATE_LINE_RE =
	/^(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,?\s*\d{4})?|\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}|\d{4}-\d{2}-\d{2})$/i;

// Matches ISO date in a filename: 2026-07-30
const FILENAME_ISO_RE = /(\d{4})[-_](\d{1,2})[-_](\d{1,2})/;
// Matches "Jul 30" or "July 30" in a filename
const FILENAME_MONTH_RE =
	/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s._-]+(\d{1,2})/i;

// Handles MM/DD/YY, MM.DD.YY, MM-DD-YY, MM/DD/YYYY, etc.
const NUMERIC_DATE_RE = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/;

function tryParseDate(str: string): Date | null {
	// Try numeric separator formats first (JS Date can't parse MM.DD.YY)
	const numeric = NUMERIC_DATE_RE.exec(str);
	if (numeric) {
		let [, m, d, y] = numeric;
		const year = y.length === 2 ? 2000 + parseInt(y) : parseInt(y);
		const date = new Date(year, parseInt(m) - 1, parseInt(d));
		if (!isNaN(date.getTime())) return date;
	}
	const d = new Date(str);
	return isNaN(d.getTime()) ? null : d;
}

function parseDateFromFilename(name: string): Date | null {
	const iso = FILENAME_ISO_RE.exec(name);
	if (iso) return tryParseDate(`${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`);
	const month = FILENAME_MONTH_RE.exec(name);
	if (month) return tryParseDate(`${month[1]} ${month[2]}`);
	return null;
}

function normalize(text: string): string {
	return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function hasDateHeaders(text: string): boolean {
	return normalize(text).split("\n").some((l) => DATE_LINE_RE.test(l.trim()));
}

function splitByDateHeaders(text: string): ParsedEntry[] {
	const lines = normalize(text).split("\n");
	const entries: ParsedEntry[] = [];
	let currentDate: Date | null = null;
	let currentLines: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (DATE_LINE_RE.test(trimmed)) {
			const body = currentLines.join("\n").trim();
			if (body) entries.push({ date: currentDate, body });
			currentDate = tryParseDate(trimmed);
			currentLines = [];
		} else {
			currentLines.push(line);
		}
	}

	const body = currentLines.join("\n").trim();
	if (body) entries.push({ date: currentDate, body });

	return entries.filter((e) => e.body.length > 0);
}

function splitByDividers(text: string): ParsedEntry[] {
	const sections = text
		.split(/\n(?:---|\*\*\*)\n|\n{2,}/)
		.map((s) => s.trim())
		.filter(Boolean);
	return sections.map((body) => ({ date: null, body }));
}

export function parseDateDocument(text: string): ParsedEntry[] {
	const normalized = normalize(text);
	if (hasDateHeaders(normalized)) return splitByDateHeaders(normalized);
	if (/\n(?:---|\*\*\*)\n|\n{2,}/.test(normalized)) return splitByDividers(normalized);
	const body = normalized.trim();
	return body ? [{ date: null, body }] : [];
}

export function parseFiles(files: FileList): Promise<ParsedEntry[]> {
	const promises = Array.from(files).map(
		(file) =>
			new Promise<ParsedEntry[]>((resolve) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const text = normalize((e.target?.result as string).trim());
					const parsed = parseDateDocument(text);
					if (parsed.length > 1) {
						// Multi-dream file — use dates from headers
						resolve(parsed);
					} else {
						// Single dream — try filename for date, fall back to file.lastModified
						const dateFromName = parseDateFromFilename(file.name);
						const date = parsed[0]?.date ?? dateFromName ?? new Date(file.lastModified);
						resolve([{ date, body: text }]);
					}
				};
				reader.readAsText(file);
			}),
	);
	return Promise.all(promises).then((nested) => nested.flat());
}

