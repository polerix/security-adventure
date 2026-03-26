import json
import argparse
import sys
import os

DICTIONARY_FILE = 'eccc_data_dictionary_bilingual.json'

class security-adventureValidator:
    def __init__(self, dict_path=DICTIONARY_FILE):
        self.errors = []
        self.warnings = []
        self.eccc_dict = self._load_dictionary(dict_path)

    def _load_dictionary(self, filepath):
        if not os.path.exists(filepath):
            print(f"Warning: Data dictionary not found at {filepath}.", file=sys.stderr)
            return {"themes": [], "regions": [], "sentiments": []}
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading dictionary: {e}", file=sys.stderr)
            return {"themes": [], "regions": [], "sentiments": []}

    def _get_valid_values(self, category, lang='en'):
        """Helper to extract a list of valid string values for a category and language."""
        if category not in self.eccc_dict:
            return []
        return [item.get(lang) for item in self.eccc_dict[category] if lang in item]

    def validate_bilingual_string(self, obj, field_name, context):
        """Ensures a field is a dict containing 'en' and 'fr' strings."""
        if not isinstance(obj, dict):
            self.errors.append(f"{context}: '{field_name}' must be a bilingual dictionary with 'en' and 'fr' keys.")
            return False
        if 'en' not in obj or not isinstance(obj['en'], str):
            self.errors.append(f"{context}: '{field_name}' is missing an English ('en') string.")
        if 'fr' not in obj or not isinstance(obj['fr'], str):
            self.errors.append(f"{context}: '{field_name}' is missing a French ('fr') string.")
        return True

    def validate_schema(self, data):
        """Validates that the output matches the security-adventure Game Engine JSON Schema."""
        self.errors = []
        self.warnings = []

        if not isinstance(data, dict):
            self.errors.append("Root output must be a JSON object (dictionary).")
            return False

        # Loop through each module in the root (e.g. module1, module2)
        for module_id, module_data in data.items():
            context = f"Module '{module_id}'"
            
            # --- Schema Validation ---
            if 'title' not in module_data:
                self.errors.append(f"{context}: Missing 'title' field.")
            else:
                self.validate_bilingual_string(module_data['title'], 'title', context)
            
            if 'startNode' not in module_data:
                self.errors.append(f"{context}: Missing 'startNode' field.")

            if 'nodes' not in module_data or not isinstance(module_data['nodes'], dict):
                self.errors.append(f"{context}: Missing or invalid 'nodes' dictionary.")
            else:
                self._validate_nodes(module_data['nodes'], context)

            # --- ECCC Data Category Validation (assuming metadata is injected at the module level for CDPS) ---
            if 'metadata' in module_data:
                self._validate_metadata(module_data['metadata'], context)
            else:
                self.warnings.append(f"{context}: Missing 'metadata' block. Cannot align to ECCC dictionary.")

        return len(self.errors) == 0

    def _validate_nodes(self, nodes, context):
        for node_id, node_data in nodes.items():
            n_ctx = f"{context} -> Node '{node_id}'"
            if 'text' not in node_data:
                self.errors.append(f"{n_ctx}: Missing 'text' field.")
            else:
                self.validate_bilingual_string(node_data['text'], 'text', n_ctx)

            if 'choices' in node_data:
                if not isinstance(node_data['choices'], list):
                    self.errors.append(f"{n_ctx}: 'choices' must be a list.")
                else:
                    for i, choice in enumerate(node_data['choices']):
                        c_ctx = f"{n_ctx} -> Choice {i}"
                        if 'label' not in choice:
                            self.errors.append(f"{c_ctx}: Missing 'label'.")
                        if 'next' not in choice:
                            self.errors.append(f"{c_ctx}: Missing 'next' routing target.")

    def _validate_metadata(self, metadata, context):
        """Validates outputs map correctly to the standardized ECCC data category list."""
        valid_themes_en = self._get_valid_values('themes', 'en')
        valid_regions_en = self._get_valid_values('regions', 'en')

        # Check Theme
        if 'theme' in metadata:
            if metadata['theme'] not in valid_themes_en:
                self.errors.append(f"{context} Metadata: '{metadata['theme']}' is not a valid ECCC Theme (Expected one of: {valid_themes_en}).")
        else:
            self.warnings.append(f"{context} Metadata: Missing 'theme' category.")

        # Check Region
        if 'region' in metadata:
            if metadata['region'] not in valid_regions_en:
                self.errors.append(f"{context} Metadata: '{metadata['region']}' is not a valid ECCC Region.")


    def report(self):
        """Prints out the validation report."""
        if self.errors:
            print("\n❌ VALIDATION FAILED")
            for err in self.errors:
                print(f"  - ERROR: {err}")
        else:
            print("\n✅ VALIDATION PASSED")
            
        for warn in self.warnings:
            print(f"  - WARN: {warn}")


def run_test():
    """Runs a self-test of the metadata validator with good and bad data based on the Schema."""
    validator = security-adventureValidator()

    print("--- Test 1: Valid Game Module with ECCC Metadata ---")
    valid_module = {
        "module1": {
            "title": { "en": "Test Module", "fr": "Module de Test" },
            "startNode": "start",
            "metadata": {
                "theme": "Biodiversity",
                "region": "Pacific"
            },
            "nodes": {
                "start": {
                    "text": { "en": "Hello", "fr": "Bonjour" },
                    "choices": [
                         { "label": { "en": "Next", "fr": "Suivant" }, "next": "end" }
                    ]
                }
            }
        }
    }
    is_valid = validator.validate_schema(valid_module)
    validator.report()
    assert is_valid == True, "Failed to validate a perfectly valid module."

    print("\n--- Test 2: Invalid Schema & Metadata Mismatch ---")
    invalid_module = {
         "module2": {
             # Missing bilingual title (schema error)
             "title": "A bad title", 
             "startNode": "start",
             "metadata": {
                 # Invalid ECCC Theme mapping
                 "theme": "Unknown Economics",
                 "region": "Toronto"
             },
             "nodes": {
                 "start": {
                     "text": { "en": "Oops" } # Missing fr
                 }
             }
         }
    }
    is_valid = validator.validate_schema(invalid_module)
    validator.report()
    assert is_valid == False, "Validator failed to catch schema and metadata errors."

    print("\n✅ All automated validation tests completed successfully.")
    return 0


def process_file(filepath: str):
     if not os.path.exists(filepath):
         print(f"Error: File not found - {filepath}", file=sys.stderr)
         sys.exit(1)
         
     try:
          with open(filepath, 'r', encoding='utf-8') as f:
               data = json.load(f)
     except Exception as e:
          print(f"Error reading JSON: {e}", file=sys.stderr)
          sys.exit(1)
          
     # Look for the dictionary in the same directory as the validator script
     script_dir = os.path.dirname(os.path.abspath(__file__))
     dict_path = os.path.join(script_dir, DICTIONARY_FILE)
     
     validator = security-adventureValidator(dict_path=dict_path)
     is_valid = validator.validate_schema(data)
     
     print(f"Validating file: {filepath}")
     validator.report()
     
     if not is_valid:
          sys.exit(1)
     else:
          sys.exit(0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="security-adventure Schema & ECCC Metadata Validator")
    parser.add_argument('--test', action='store_true', help='Run self-verification test')
    parser.add_argument('--file', type=str, help='Validate a specific JSON gameplay output file')
    
    args = parser.parse_args()

    if args.test:
        sys.exit(run_test())
    elif args.file:
         process_file(args.file)
    else:
        print("Please specify --test or --file <filename>")
