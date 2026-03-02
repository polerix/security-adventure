import json
import os
import argparse
import sys
from typing import List, Dict

# Proposed Folder Structure for Protected B Data Residency:
# /app_data
# ├── /1_Raw            # Incoming public consultation entries (CSVs/JSONs) -> Immutable
# ├── /2_Chunked        # Processed chunks carrying inherited metadata -> Ready for Embedding
# └── /3_Embedded       # Vector database integration point (Azure Search / Cosmos DB)

class RAGChunker:
    def __init__(self, raw_dir: str = "./1_Raw", chunked_dir: str = "./2_Chunked", max_chars: int = 2000, overlap_chars: int = 200):
        self.raw_dir = raw_dir
        self.chunked_dir = chunked_dir
        self.max_chars = max_chars  # For a production app, use tiktoken for token-based chunking. Character-based for this prototype.
        self.overlap_chars = overlap_chars

        # Ensure directories exist
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.chunked_dir, exist_ok=True)

    def chunk_text(self, text: str) -> List[str]:
        """Splits a long text into overlapping chunks using character length."""
        if not text:
            return []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = min(start + self.max_chars, text_length)
            
            # If we aren't at the end of the text, try to find a natural break point (e.g. newline or period)
            if end < text_length:
                last_newline = text.rfind('\n', start, end)
                if last_newline != -1 and last_newline > start + self.max_chars // 2:
                    end = last_newline + 1
                else:
                    last_period = text.rfind('.', start, end)
                    if last_period != -1 and last_period > start + self.max_chars // 2:
                        end = last_period + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - self.overlap_chars
            
            # Prevent infinite loops if overlap is bigger than max_chars
            if start <= 0 and len(chunks) > 0:
                break
            # Ensure we progress
            if end == text_length:
                 break
                 
        return chunks

    def process_file(self, filename: str):
        """Reads a valid JSON consultation entry, chunks the text, and writes out the chunks with preserved metadata."""
        filepath = os.path.join(self.raw_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading {filename}: {e}", file=sys.stderr)
            return False

        # Ensure required ECCC metadata is present
        required_keys = ['consultation_id', 'entry_id', 'received_date', 'text_content']
        if not all(k in data for k in required_keys):
            print(f"File {filename} is missing required metadata fields. Skipping.", file=sys.stderr)
            return False

        original_text = data['text_content']
        chunks = self.chunk_text(original_text)
        
        total_chunks = len(chunks)
        print(f"Info: Split {filename} into {total_chunks} chunks.")

        for i, chunk in enumerate(chunks, 1):
            chunk_metadata = {
                "consultation_id": data['consultation_id'],
                "entry_id": data['entry_id'],
                "chunk_index": i,
                "total_chunks": total_chunks,
                "received_date": data['received_date'],
                "text_content": chunk,
            }
            
            # Optional: Add any extra thematic topics or pre-defined tags provided in the raw data
            if 'topics' in data:
                 chunk_metadata['topics'] = data['topics']
            
            # Save the chunked file
            chunk_filename = f"{data['entry_id']}_chunk_{i}_of_{total_chunks}.json"
            chunk_filepath = os.path.join(self.chunked_dir, chunk_filename)
            
            with open(chunk_filepath, 'w', encoding='utf-8') as out_f:
                json.dump(chunk_metadata, out_f, indent=2, ensure_ascii=False)

        return True

def run_test():
    """Runs a test validation to prove the utility works for RAG integration."""
    print("Running automated test for Chunking Utility...")
    chunker = RAGChunker(raw_dir="./test_1_Raw", chunked_dir="./test_2_Chunked", max_chars=100, overlap_chars=20)
    
    test_entry = {
        "consultation_id": "CDPS-2026",
        "entry_id": "TEST-001",
        "received_date": "2026-03-02",
        "text_content": "This is a very long text that needs to be broken down into smaller chunks. We must make sure that it preserves metadata. Data residency in Canada via Azure OpenAI is paramount for our Protected B data pipelines."
    }
    
    # Write test file
    with open(os.path.join(chunker.raw_dir, "test_input.json"), 'w') as f:
        json.dump(test_entry, f)
        
    success = chunker.process_file("test_input.json")
    
    if success:
        print("Success! Sent test data through the chunker.")
        files = os.listdir(chunker.chunked_dir)
        print(f"Generated {len(files)} chunk files:")
        for file in files:
             print(f" - {file}")
             # Print an example chunk
             if file.endswith("1_of_3.json"):
                  with open(os.path.join(chunker.chunked_dir, file), 'r') as cf:
                       print(json.dumps(json.load(cf), indent=2))
        return 0
    else:
        print("Test failed.")
        return 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CDPS RAG Document Chunker (Protected B Compliant)")
    parser.add_argument('--test', action='store_true', help='Run self-verification test')
    parser.add_argument('--file', type=str, help='Process a specific file in the Raw directory')
    args = parser.parse_args()

    if args.test:
        sys.exit(run_test())
    elif args.file:
        chunker = RAGChunker()
        chunker.process_file(args.file)
    else:
        print("Please specify --test or --file <filename>")
