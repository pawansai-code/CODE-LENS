from dataclasses import dataclass

@dataclass
class ScoreResult:
    faithfulness: float
    answer_relevance: float

class RAGASEvaluator:
    def __init__(self):
        pass
        
    def evaluate(self, question: str, answer: str, context: str) -> ScoreResult:
        """Computes faithfulness and answer relevance using RAGAS."""
        pass
