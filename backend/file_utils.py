"""
File & name utilities for AIRA OS.
"""
import re


def sanitize_project_name(name: str, fallback: str = "aira-project") -> str:
    """
    Convert an arbitrary project title into a filesystem-safe directory name.

    Windows forbids the characters: backslash, slash, colon, asterisk, question
    mark, double-quote, less-than, greater-than, pipe. Ampersands and other
    punctuation are also stripped for clean URLs/folders.
    """
    if not name or not name.strip():
        return fallback

    # Lowercase and replace spaces with dashes
    s = name.strip().lower().replace(" ", "-")

    # Replace any invalid or messy characters with a dash
    s = re.sub(r"[^a-z0-9_-]+", "-", s)

    # Collapse multiple dashes and trim
    s = re.sub(r"-{2,}", "-", s).strip("-")

    return s or fallback
