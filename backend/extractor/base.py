from typing import Set, Tuple

class KeywordExtractor:
    def extract(self, text: str) -> Tuple[Set[str], Set[str]]:
        """
        Given a block of text, return two sets:
         - required keywords
         - preferred keywords
        """
        raise NotImplementedError
