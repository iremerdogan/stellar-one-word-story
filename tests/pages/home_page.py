class HomePage:
    def __init__(self, page):
        self.page = page
        self.url = "http://localhost:3000"
        self.connect_wallet_button = page.get_by_text("Connect Freighter Wallet")
        self.word_input = page.get_by_placeholder("Your word...")
        self.submit_button = page.get_by_text("Submit")
        self.story_label = page.get_by_text("The Story So Far")

    def navigate(self):
        self.page.goto(self.url)

    def submit_word(self, word):
        self.word_input.fill(word)
        self.submit_button.click()

    def get_message(self):
        return self.page.get_by_test_id("status-message")

    def is_wallet_connected(self):
        return self.page.get_by_text("Connected:").is_visible()