import pytest
from playwright.sync_api import sync_playwright
from pages.home_page import HomePage

@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        yield browser
        browser.close()

@pytest.fixture
def home_page(browser):
    page = browser.new_page()
    home = HomePage(page)
    home.navigate()
    page.wait_for_load_state("networkidle")
    yield home
    page.close()
