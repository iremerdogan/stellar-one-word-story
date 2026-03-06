import pytest
from pytest_bdd import given, when, then, scenario
from pages.home_page import HomePage

@scenario("features/story.feature", "Page loads successfully")
def test_page_loads():
    pass

@scenario("features/story.feature", "Submit without wallet shows error")
def test_submit_without_wallet():
    pass

@given("the user opens the home page")
def open_home_page(home_page):
    pass

@then("the connect wallet button is visible")
def connect_button_visible(home_page):
    assert home_page.connect_wallet_button.is_visible()

@then("the word input is visible")
def word_input_visible(home_page):
    assert home_page.word_input.is_visible()

@then("the submit button is visible")
def submit_button_visible(home_page):
    assert home_page.submit_button.is_visible()

@then("the story section is visible")
def story_section_visible(home_page):
    assert home_page.story_label.is_visible()

@when('the user types "hello" in the word input')
def type_word(home_page):
    home_page.word_input.fill("hello")

@when("the user clicks submit")
def click_submit(home_page):
    home_page.submit_button.click()

@then('the message "Please connect your wallet first." is visible')
def error_message_visible(home_page):
    message = home_page.page.get_by_test_id("status-message")
    message.wait_for(state="visible", timeout=3000)
    assert "Please connect your wallet first." in message.inner_text()