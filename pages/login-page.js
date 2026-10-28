
const { By, until } = require("selenium-webdriver");

class LoginPage {
    constructor(driver) {
        this.driver = driver;

        this.usernameInput = By.id("user-name");
        this.passwordInput = By.id("password");
        this.loginButton = By.id("login-button");
        this.errorMessage = By.css("[data-test='error']");
        this.inventoryContainer = By.id("inventory_container");
    }

    async open() {
        await this.driver.get("https://www.saucedemo.com/");
        await this.driver.wait(
            until.elementLocated(this.usernameInput),
            10000
        );
    }

    async enterUsername(username) {
        const field = await this.driver.findElement(this.usernameInput);
        await field.clear();
        await field.sendKeys(username);
    }

    async enterPassword(password) {
        const field = await this.driver.findElement(this.passwordInput);
        await field.clear();
        await field.sendKeys(password);
    }

    async clickLogin() {
        await this.driver.findElement(this.loginButton).click();
    }

    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }

    async waitForInventory() {
        await this.driver.wait(
            until.elementLocated(this.inventoryContainer),
            10000
        );
    }

    async getErrorMessage() {
        const error = await this.driver.wait(
            until.elementLocated(this.errorMessage),
            10000
        );
        return await error.getText();
    }
}

module.exports = LoginPage;
