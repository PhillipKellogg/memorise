"""
SM-2 Spaced Repetition Algorithm

Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

quality: int 0–5
    5 - perfect response
    4 - correct response after a hesitation
    3 - correct response recalled with serious difficulty
    2 - incorrect response; where the correct one seemed easy to recall
    1 - incorrect response; the correct one remembered
    0 - complete blackout
"""

from datetime import datetime, timedelta, timezone
from dataclasses import dataclass

EF_MIN = 1.3


@dataclass
class SM2Result:
    easiness_factor: float
    interval: int          # days until next review
    repetitions: int
    next_review: datetime


def sm2_review(
    quality: int,
    easiness_factor: float,
    interval: int,
    repetitions: int,
) -> SM2Result:
    """
    Run one SM-2 review cycle and return updated scheduling values.

    Args:
        quality:          User response quality, 0–5.
        easiness_factor:  Current EF (≥ 1.3).
        interval:         Current interval in days.
        repetitions:      Number of consecutive successful reviews.

    Returns:
        SM2Result with updated values and the next review datetime (UTC).
    """
    if not 0 <= quality <= 5:
        raise ValueError(f"quality must be 0–5, got {quality}")

    # Update easiness factor
    new_ef = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ef = max(EF_MIN, new_ef)

    if quality < 3:
        # Failed recall — reset to beginning
        new_repetitions = 0
        new_interval = 1
    else:
        # Successful recall
        new_repetitions = repetitions + 1
        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            new_interval = round(interval * new_ef)

    next_review = datetime.now(tz=timezone.utc) + timedelta(days=new_interval)

    return SM2Result(
        easiness_factor=round(new_ef, 4),
        interval=new_interval,
        repetitions=new_repetitions,
        next_review=next_review,
    )
