/**
 * One-time migration: encrypts plaintext body/analysis/analyzed_body
 * for all existing dreams in Supabase.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS).
 * Run with: npx tsx scripts/encryptExistingDreams.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { encrypt, decrypt } from "../lib/utils/encryption";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Decode the JWT payload to confirm it's the service_role key
try {
	const payload = JSON.parse(Buffer.from(serviceKey.split(".")[1], "base64").toString());
	console.log(`Using key with role: "${payload.role}" — should be "service_role"`);
} catch {
	console.error("Could not decode SUPABASE_SERVICE_ROLE_KEY — is it set correctly?");
}

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	serviceKey,
	{ auth: { autoRefreshToken: false, persistSession: false } },
);

// If decrypt returns something different than the input, it was already encrypted.
// AES-GCM authentication makes false positives essentially impossible.
async function isEncrypted(text: string): Promise<boolean> {
	const result = await decrypt(text);
	return result !== text;
}

async function main() {
	const encKey = process.env.NEXT_PUBLIC_DREAM_ENCRYPTION_KEY;
	console.log(`Encryption key loaded: ${encKey ? `yes (${encKey.slice(0, 6)}...)` : "NO — aborting"}`);
	if (!encKey) process.exit(1);

	console.log("Fetching all dreams...");
	const { data: dreams, error } = await supabase
		.from("dreams")
		.select("id, body, analysis, analyzed_body");

	if (error) throw new Error(`Supabase fetch failed: ${error.message}`);
	console.log(`Found ${dreams.length} dreams`);

	let encrypted = 0;
	let skipped = 0;
	let failed = 0;

	for (const dream of dreams) {
		const fields: Record<string, string> = {};

		if (dream.body && !(await isEncrypted(dream.body))) {
			fields.body = await encrypt(dream.body);
		}
		if (dream.analysis && !(await isEncrypted(dream.analysis))) {
			fields.analysis = await encrypt(dream.analysis);
		}
		if (dream.analyzed_body && !(await isEncrypted(dream.analyzed_body))) {
			fields.analyzed_body = await encrypt(dream.analyzed_body);
		}

		if (Object.keys(fields).length === 0) {
			skipped++;
			continue;
		}

		const { data: updated, error: updateError } = await supabase
			.from("dreams")
			.update(fields)
			.eq("id", dream.id)
			.select("id, body");

		if (updateError) {
			console.error(`  ✗ Failed dream ${dream.id}: ${updateError.message}`);
			failed++;
		} else {
			const newBody = updated?.[0]?.body ?? "";
			const looksDifferent = newBody !== dream.body;
			console.log(`  ${looksDifferent ? "✓" : "⚠ unchanged"} dream ${dream.id}`);
			if (looksDifferent) encrypted++; else failed++;
		}
	}

	console.log(`\nDone — ${encrypted} encrypted, ${skipped} already encrypted, ${failed} failed.`);
}

main().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
