// cypress/support/commands.ts

Cypress.Commands.add('initializeUser', (userName: string = 'TestUser') => {
    // بدون نیاز به صفحهٔ ورود
    // مستقیماً صفحهٔ اصلی را باز کن
    cy.visit('/', {
        failOnStatusCode: false
    });

    // منتظر لود شدن صفحه
    cy.get('body', { timeout: 10000 }).should('exist');
});

Cypress.Commands.add('navigateToPage', (pageName: string) => {
    const pageMap: Record<string, string> = {
        dashboard: '/',
        todos: '/todos',
        weather: '/weather',
        profile: '/profile'
    };

    const path = pageMap[pageName] || `/${pageName}`;
    cy.visit(path);
    cy.get('body').should('exist');
});

Cypress.Commands.add('changeLanguage', (locale: 'en' | 'fa') => {
    // اگر navbar داری
    cy.get('[aria-label="Language"], [title*="Language"]').click({ force: true });
    const localeName = locale === 'fa' ? 'فارسی' : 'English';
    cy.contains(localeName).click({ force: true });
});

Cypress.Commands.add('changeTheme', (theme: 'light' | 'dark') => {
    cy.get('[aria-label="Theme"], [title*="Theme"]').click({ force: true });
    const themeName = theme === 'light' ? 'Light' : 'Dark';
    cy.contains(themeName).click({ force: true });
});

declare global {
    namespace Cypress {
        interface Chainable {
            initializeUser(userName?: string): Chainable<void>;
            navigateToPage(pageName: string): Chainable<void>;
            changeLanguage(locale: 'en' | 'fa'): Chainable<void>;
            changeTheme(theme: 'light' | 'dark'): Chainable<void>;
        }
    }
}

export { };
