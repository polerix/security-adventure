import json
import re

def load_dictionary(filepath):
    """Loads the ECCC Data Dictionary created for CDPS alignment."""
    with open(filepath, 'r') as f:
        return json.load(f)

def score_feedback(user_input, data_dict):
    """
    Scores user feedback (text or choices) against ECCC thematic categories.
    Returns a dictionary of scores per category.
    """
    scores = {}
    # Convert input to lowercase for consistent fuzzy matching
    text_content = str(user_input).lower()
    
    for category in data_dict['thematic_categories']:
        cat_id = category['id']
        keywords = category['keywords']
        
        # Calculate frequency of keyword matches
        matches = 0
        for word in keywords:
            # Use regex for basic boundary matching to avoid partial word hits
            if re.search(rf'\b{word}\b', text_content):
                matches += 1
        
        # Simple relevance score: (Matches / Total Keywords) * 100
        # This can be upgraded to Cosine Similarity using embeddings in Antigravity
        relevance_score = (matches / len(keywords)) * 100 if keywords else 0
        
        scores[category['label']] = {
            "score": round(relevance_score, 2),
            "branch": category['eccc_branch'],
            "matched_count": matches
        }
    
    return scores

# Example usage within the SecurityAdventure pipeline:
# user_feedback = "I am concerned about carbon pricing and net-zero targets."
# results = score_feedback(user_feedback, load_dictionary('eccc_data_dictionary.json'))