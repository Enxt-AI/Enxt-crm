import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { brainDocuments } from "../../../lib/demo-documents";

export const dynamic = "force-dynamic";

const dataFilePath = path.join(process.cwd(), "src", "data", "documents.json");

export async function GET() {
  try {
    // Try to read the file
    try {
      const fileData = await fs.readFile(dataFilePath, "utf8");
      return NextResponse.json(JSON.parse(fileData));
    } catch (err: any) {
      // If file doesn't exist, create it with the initial mock data
      if (err.code === "ENOENT") {
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(dataFilePath, JSON.stringify(brainDocuments, null, 2), "utf8");
        return NextResponse.json(brainDocuments);
      }
      throw err;
    }
  } catch (error) {
    console.error("Failed to read documents:", error);
    return NextResponse.json({ error: "Failed to read documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const documents = await request.json();
    
    // Ensure the directory exists
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    
    // Write the new documents payload to the file
    await fs.writeFile(dataFilePath, JSON.stringify(documents, null, 2), "utf8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save documents:", error);
    return NextResponse.json({ error: "Failed to save documents" }, { status: 500 });
  }
}
