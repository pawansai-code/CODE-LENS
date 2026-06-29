import os
import tempfile
import shutil
from pathlib import Path
# pyrefly: ignore [missing-import]
from git import Repo

class RepoLoadError(Exception):
    pass

class RepoLoader:
    def __init__(self):
        self._temp_dir = None
        
    def load(self, source: str) -> Path:
        """Accepts local path or GitHub URL. Clones repo to temp dir if URL. Returns Path to root."""
        if source.startswith("http://") or source.startswith("https://") or source.startswith("git@"):
            return self._clone_repo(source)
        else:
            path = Path(source)
            if not path.exists():
                raise RepoLoadError(f"Local path does not exist: {source}")
            return path
        
    def _clone_repo(self, url: str) -> Path:
        """Runs git clone to a temporary dir, then moves it to a persistent dir. Raises RepoLoadError on failure."""
        try:
            repo_dir = Path(__file__).parent.parent / "data" / "repo"
            
            # 1. Clone to a guaranteed fresh, empty temporary directory
            temp_dir = tempfile.mkdtemp(prefix="codelens_repo_")
            Repo.clone_from(url, temp_dir)
            
            # 2. Clear out the old persistent directory
            if repo_dir.exists():
                shutil.rmtree(repo_dir, ignore_errors=True)
                
            # If rmtree failed to delete everything (e.g. read-only .git files on Windows), 
            # forcibly rename the leftover folder out of the way.
            if repo_dir.exists():
                import time
                try:
                    os.rename(str(repo_dir), str(repo_dir) + f"_old_{int(time.time())}")
                except Exception:
                    pass
            
            # 3. Move the fresh clone into the persistent location
            try:
                shutil.move(temp_dir, str(repo_dir))
                self._temp_dir = str(repo_dir)
                return repo_dir
            except Exception as e:
                # Fallback if move fails due to strict Windows file locks
                print(f"[WARNING] Could not move to {repo_dir}. Using temp dir. Error: {e}")
                self._temp_dir = temp_dir
                return Path(temp_dir)
                
        except Exception as e:
            raise RepoLoadError(f"Failed to clone repository: {str(e)}")
            
    def cleanup(self):
        """No-op. We keep the repository on disk for file content access and UI."""
        pass
