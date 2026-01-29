"""
Neuromorphic Engine for Intelligent Query Processing
Uses pattern matching for query classification and relevance scoring
Compatible with any Python environment (no external dependencies required)
"""

import re
from typing import Dict, List, Tuple, Optional


class NeuromorphicEngine:
    """
    Lightweight neuromorphic-inspired computing engine for:
    - Query classification (scholarship vs internship)
    - Keyword pattern recognition
    - Relevance scoring
    - Fallback pattern matching if Brian2 is unavailable
    """
    
    def __init__(self):
        self.scholar_patterns = self._build_scholar_patterns()
        self.intern_patterns = self._build_intern_patterns()
        self.is_brian_available = False  # Disabled due to NumPy compatibility
        # Brian2 would require numpy<2, disabled for compatibility
        print("⚡ Neuromorphic Engine initialized (pattern matching mode)")
    
    def _build_scholar_patterns(self) -> Dict[str, float]:
        """Build weighted patterns for scholarship queries"""
        return {
            # Core scholarship terms
            "scholarship": 1.0,
            "grant": 0.9,
            "fellowship": 0.9,
            "bursary": 0.85,
            "tuition": 0.8,
            "financial aid": 0.95,
            "financial need": 0.9,
            
            # Academic terms
            "university": 0.7,
            "college": 0.7,
            "school": 0.6,
            "academic": 0.7,
            "study": 0.6,
            "education": 0.7,
            "degree": 0.6,
            
            # Merit-based terms
            "excellence": 0.8,
            "merit": 0.8,
            "achievement": 0.7,
            "gpa": 0.75,
            "distinction": 0.75,
            
            # Funding terms
            "funding": 0.85,
            "fund": 0.7,
            "support": 0.6,
            "assistance": 0.7,
            "award": 0.7,
            
            # Program types
            "undergraduate": 0.6,
            "postgraduate": 0.6,
            "graduate": 0.5,
            "research": 0.6,
            "masters": 0.6,
            "phd": 0.6,
            
            # Cameroon context
            "cameroon": 0.5,
            "bamenda": 0.4,
            "douala": 0.4,
            "yaoundé": 0.4,
        }
    
    def _build_intern_patterns(self) -> Dict[str, float]:
        """Build weighted patterns for internship queries"""
        return {
            # Core internship terms (including plural forms)
            "internship": 1.0,
            "internships": 1.0,
            "intern": 0.9,
            "interns": 0.9,
            "trainee": 0.85,
            "trainees": 0.85,
            "training": 0.8,
            "apprenticeship": 0.8,
            "apprenticeships": 0.8,
            
            # Employment terms
            "job": 0.7,
            "work": 0.6,
            "employment": 0.75,
            "career": 0.7,
            "professional": 0.65,
            
            # Company terms
            "company": 0.6,
            "companies": 0.6,
            "corporation": 0.6,
            "business": 0.6,
            "enterprise": 0.55,
            
            # Experience terms
            "experience": 0.7,
            "placement": 0.75,
            "practical": 0.6,
            "hands-on": 0.65,
            
            # Industry terms
            "telecommunications": 0.5,
            "banking": 0.5,
            "finance": 0.55,
            "technology": 0.55,
            "agriculture": 0.5,
            "energy": 0.5,
            
            # Benefits terms
            "stipend": 0.7,
            "salary": 0.5,
            "paid": 0.6,
            "allowance": 0.65,
            
            # Duration terms
            "summer": 0.6,
            "year": 0.4,
            "months": 0.5,
            "rotation": 0.55,
        }
    
    def _create_snn_model(self):
        """Create a simple spiking neural network model for pattern classification"""
        try:
            from brian2 import NeuronGroup, Synapses, SpikeMonitor, run, ms, mV
            
            # Create neuron groups
            # Input neurons (scholarship and internship patterns)
            self.input_group = NeuronGroup(
                2,  # Two input neurons: one for scholarship, one for internship
                'v: volt',
                threshold='v > -50*mV',
                reset='v = -70*mV',
                method='exponential_euler'
            )
            self.input_group.v = -70 * mV
            
            # Output neuron (decision)
            self.output_group = NeuronGroup(
                1,
                'v: volt',
                threshold='v > -50*mV',
                reset='v = -70*mV',
                method='exponential_euler'
            )
            self.output_group.v = -70 * mV
            
            # Create synapses
            self.synapses = Synapses(
                self.input_group,
                self.output_group,
                'w: 1',
                on_pre='v += w*mV'
            )
            self.synapses.connect(i=[0, 1], j=[0, 0])
            
            # Set weights
            self.synapses.w = [1.0, -0.5]  # Positive for scholarship, negative for internship
            
            # Monitor spikes
            self.spike_monitor = SpikeMonitor(self.output_group)
            
            return True
        except Exception as e:
            print(f"Error creating SNN model: {e}")
            return False
    
    def preprocess_query(self, query: str) -> List[str]:
        """Preprocess query: tokenize and clean"""
        # Convert to lowercase and extract words
        query_lower = query.lower()
        tokens = re.findall(r'\w+', query_lower)
        # Remove very short tokens
        tokens = [t for t in tokens if len(t) > 2]
        return tokens
    
    def calculate_scores(self, query: str) -> Tuple[float, float]:
        """
        Calculate relevance scores for scholarship and internship categories
        
        Returns:
            Tuple of (scholarship_score, internship_score)
        """
        tokens = self.preprocess_query(query)
        
        scholar_score = 0.0
        intern_score = 0.0
        matched_patterns = []
        
        for token in tokens:
            if token in self.scholar_patterns:
                scholar_score += self.scholar_patterns[token]
                matched_patterns.append(f"scholar:{token}")
            if token in self.intern_patterns:
                intern_score += self.intern_patterns[token]
                matched_patterns.append(f"intern:{token}")
        
        # Normalize scores
        max_possible = max(len(tokens) * 1.0, 1.0)
        scholar_score = min(scholar_score / max_possible, 1.0)
        intern_score = min(intern_score / max_possible, 1.0)
        
        return scholar_score, intern_score
    
    def classify_query(self, query: str) -> Dict:
        """
        Classify query using neuromorphic pattern matching
        
        Returns:
            Dict with classification results and confidence scores
        """
        scholar_score, intern_score = self.calculate_scores(query)
        
        # Determine category
        if scholar_score > intern_score:
            category = "scholarship"
            confidence = scholar_score
        elif intern_score > scholar_score:
            category = "internship"
            confidence = intern_score
        else:
            # Tie-breaker using context
            if scholar_score > 0.05:  # Lower threshold
                category = "scholarship"  # Default to scholarship
                confidence = scholar_score
            else:
                category = "general"
                confidence = 0.5
        
        return {
            "category": category,
            "confidence": confidence,
            "scholarship_score": scholar_score,
            "internship_score": intern_score,
            "is_kb_query": confidence > 0.05  # Lower threshold from 0.3 to 0.05
        }
    
    def calculate_relevance_score(self, query: str, keywords: List[str]) -> float:
        """
        Calculate relevance score between query and document keywords
        
        Args:
            query: User query
            keywords: Document keywords to match against
        
        Returns:
            Relevance score between 0 and 1
        """
        query_tokens = set(self.preprocess_query(query))
        keyword_set = set(k.lower() for k in keywords)
        
        if not query_tokens or not keyword_set:
            return 0.0
        
        # Calculate Jaccard similarity
        intersection = query_tokens & keyword_set
        union = query_tokens | keyword_set
        
        jaccard_score = len(intersection) / len(union) if union else 0.0
        
        # Bonus for exact phrase matches
        query_lower = query.lower()
        phrase_bonus = 0.0
        for keyword in keywords:
            if keyword.lower() in query_lower:
                phrase_bonus += 0.1
        
        # Normalize and cap
        relevance = min(jaccard_score + phrase_bonus, 1.0)
        
        return relevance
    
    def rank_results(self, query: str, results: List[Dict]) -> List[Dict]:
        """
        Rank search results using neuromorphic pattern matching
        
        Args:
            query: User query
            results: List of search results
        
        Returns:
            Ranked list of results with relevance scores
        """
        if not results:
            return results
        
        # Get query classification
        classification = self.classify_query(query)
        category = classification["category"]
        
        # Calculate relevance scores for each result
        scored_results = []
        for result in results:
            # Get keywords from result
            keywords = result.get("keywords", [])
            if isinstance(keywords, str):
                keywords = keywords.split()
            
            # Calculate base relevance
            relevance = self.calculate_relevance_score(query, keywords)
            
            # Boost results matching the classified category
            result_category = result.get("category", "")
            if result_category == category:
                relevance *= 1.2  # 20% boost
                relevance = min(relevance, 1.0)
            
            # Boost based on confidence of classification
            if classification["is_kb_query"]:
                relevance *= (1 + classification["confidence"] * 0.2)
                relevance = min(relevance, 1.0)
            
            result["relevance_score"] = round(relevance, 3)
            scored_results.append(result)
        
        # Sort by relevance score
        scored_results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        
        return scored_results
    
    def enhance_query(self, query: str) -> Dict:
        """
        Enhance query with additional context using pattern matching
        
        Returns:
            Dict with enhanced query information
        """
        classification = self.classify_query(query)
        
        enhanced = {
            "original_query": query,
            "classified_category": classification["category"],
            "confidence": classification["confidence"],
            "suggested_expansion": [],
            "keywords": self.preprocess_query(query)
        }
        
        # Suggest query expansions based on classification
        if classification["category"] == "scholarship":
            enhanced["suggested_expansion"] = [
                "scholarship",
                "university",
                "financial aid",
                "grant"
            ]
        elif classification["category"] == "internship":
            enhanced["suggested_expansion"] = [
                "internship",
                "company",
                "training program",
                "work experience"
            ]
        
        return enhanced
    
    def get_query_insights(self, query: str) -> Dict:
        """
        Get detailed insights about a query
        
        Returns:
            Comprehensive query analysis
        """
        tokens = self.preprocess_query(query)
        scholar_score, intern_score = self.calculate_scores(query)
        classification = self.classify_query(query)
        
        return {
            "tokens": tokens,
            "scholarship_score": round(scholar_score, 3),
            "internship_score": round(intern_score, 3),
            "classification": classification,
            "neuromorphic_active": self.is_brian_available,
            "pattern_match_count": len([t for t in tokens if t in self.scholar_patterns or t in self.intern_patterns])
        }


# Singleton instance
neuromorphic_engine = NeuromorphicEngine()


def process_query_with_neuromorphics(query: str, knowledge_base_results: List[Dict] = None) -> Dict:
    """
    Process a query through the neuromorphic engine
    
    Args:
        query: User query
        knowledge_base_results: Optional pre-searched results to rank
    
    Returns:
        Complete query processing results
    """
    # Get query insights
    insights = neuromorphic_engine.get_query_insights(query)
    
    # Classify query
    classification = neuromorphic_engine.classify_query(query)
    
    # Enhance query
    enhanced = neuromorphic_engine.enhance_query(query)
    
    # Rank results if provided
    ranked_results = None
    if knowledge_base_results:
        ranked_results = neuromorphic_engine.rank_results(query, knowledge_base_results)
    
    return {
        "query": query,
        "classification": classification,
        "enhanced": enhanced,
        "insights": insights,
        "ranked_results": ranked_results
    }


def is_knowledge_query(query: str) -> bool:
    """Quick check if query is about scholarships/internships"""
    return neuromorphic_engine.classify_query(query)["is_kb_query"]


def get_query_category(query: str) -> str:
    """Get the classified category of a query"""
    return neuromorphic_engine.classify_query(query)["category"]

