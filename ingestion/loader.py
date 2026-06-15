from pathlib import Path
from typing import List

class RepoLoader:
    def __init__(self, exclude_patterns: List[str] = None):
        self.exclude_patterns = exclude_patterns or []
        
    def load(self, source: str) -> List[Path]:
        """Accepts local path or GitHub URL. Clones repo to temp dir if URL. Returns sorted list of .py file paths."""
        pass
        
    def _is_excluded(self, path: Path) -> bool:
        """Returns True for test files, __pycache__, migrations, vendored dirs. Configurable via config.yaml exclusion patterns."""
        pass
        
    def _clone_repo(self, url: str) -> Path:
        """Runs git clone to a temp dir. Raises RepoLoadError on failure."""
        pass
