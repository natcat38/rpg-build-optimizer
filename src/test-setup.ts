import '@testing-library/jest-dom';

// jsdom doesn't implement scrollIntoView; stub it so components that call it
// (e.g. the results-section auto-scroll in App.tsx) don't throw in tests.
Element.prototype.scrollIntoView = () => {};
