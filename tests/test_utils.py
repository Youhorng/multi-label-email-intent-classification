import pytest
from web.backend.utils import format_subject_body


def test_format_subject_body_both_present():
    s = "Subject"
    b = "Body text here"
    assert format_subject_body(s, b, sep=" ") == "Subject Body text here"


def test_format_subject_body_only_subject():
    assert format_subject_body("Hello", "", sep=" ") == "Hello"


def test_format_subject_body_only_body():
    assert format_subject_body("", "Body only") == "Body only"


def test_format_subject_body_strips_whitespace():
    assert format_subject_body(" Foo ", " Bar ", sep="|") == "Foo|Bar"
