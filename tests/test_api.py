import pytest
import requests
from pytest_bdd import given, when, then, scenario

BASE_URL = "http://localhost:3000"

@scenario("features/story.feature", "API returns story words")
def test_api_returns_story():
    pass

@given("the API is running")
def api_is_running():
    pass

@when("the user requests the story", target_fixture="api_response")
def request_story():
    response = requests.get(f"{BASE_URL}/api/get-story")
    return {"response": response}

@then("the response status is 200")
def check_status(api_response):
    assert api_response["response"].status_code == 200

@then("the response contains a words list")
def check_words(api_response):
    data = api_response["response"].json()
    assert "words" in data
    assert isinstance(data["words"], list)

def validate_word(word):
    if not word or not word.strip():
        return "Please enter a word."
    if len(word.strip().split()) > 1:
        return "One word only."
    if len(word) > 28:
        return "Word is too long."
    return None

def test_empty_word_validation():
    assert validate_word("") == "Please enter a word."

def test_whitespace_word_validation():
    assert validate_word("   ") == "Please enter a word."

def test_multiple_words_validation():
    assert validate_word("hello world") == "One word only."

def test_too_long_word_validation():
    assert validate_word("a" * 29) == "Word is too long."

def test_valid_word_validation():
    assert validate_word("hello") is None