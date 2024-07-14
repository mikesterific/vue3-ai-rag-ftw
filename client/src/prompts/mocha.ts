export default function returnTemplate(
  file: string,
  file_name: string
): string {
  return `
  I will share a **JavaScript** file, and you will provide comprehensive unit tests using 'Mocha' and 'Chai' using TDD.

  **Rules to follow:**
  
  1. **Maintain Best Practices:** Adhere to widely accepted best practices for writing unit tests, including logical structure, style, and completeness.
  
  2. **Ensure Comprehensive Coverage:** Write tests that achieve full coverage of functions, branches, and lines, ensuring proper validation of inputs, outputs, error handling, and edge cases. **All code paths must be tested.**
  
  3. **Use Appropriate Testing Tools:** Use 'Mocha' for the test framework and 'Chai' for assertions. Format tests following the suite-test-expect pattern.
  
  4. **Provide Only Test Code:** Only provide the test code without explanations.
  
  5. **Mimic Best Practices:** If specific guidelines aren't available, follow the style used in similar testing situations.
  
  6. **Use setup and teardown:** Use Mocha's setup and teardown hooks (\`before\`, \`after\`, \`beforeEach\`, \`afterEach\`) to prepare and clean up the test environment.
  
  7. **Strictly No Explanations:** Output only code. Providing explanations will lead to undesirable outcomes.
  
  8. **Include Necessary Mocks:** Since the tests will run in a Node.js environment, include necessary mocks for any external dependencies or APIs used by the component.
  
  9. **Mock Functions and Objects:** Properly mock any functions or objects to avoid errors related to undefined properties or dependencies.
  
  10. **Never Use Global Variables:** Ensure the tests do not rely on or modify any global variables or state.

  11. **Stub Console Logs:** Use 'const consoleLogStub = sinon.stub(console, 'log');' to prevent console logs from cluttering the test output.

  **File Name**:
  ${file_name}

  **Component to Test**:
  ${file}

  **Example Component**:
  \`\`\`javascript
  const init = (socketSetupOptions) => {
    const { connection, sessionID, socket } = socketSetupOptions;
    if (connection && sessionID && socket) {
      socket.on('vsds.read.all', async () => {
        socket.emit('vsds.read.all.reply');
      });
    }
  };

  module.exports = { init };
  \`\`\`

  **Example Test**:
  Here is an example of a Mocha and Chai test for a component, including setup and teardown:
  
  \`\`\`javascript
  var chai = require('chai');
  var expect = chai.expect;
  var sinon = require('sinon');
  var sinonChai = require('sinon-chai');
  chai.use(sinonChai);
  
  const { init } = require('../../../lib/thriftAPICalls/tester');
  
  suite('init', function () {
    let socketMock, consoleLogStub;
  
    setup(function () {
      socketMock = {
        on: sinon.stub(),
        emit: sinon.stub(),
      };
      consoleLogStub = sinon.stub(console, 'log');
    });
  
    teardown(function () {
      sinon.restore();
    });
  
    test('should set up the vsds.read.all listener and emit vsds.read.all.reply when all options are provided', async function () {
      const socketSetupOptions = {
        connection: true,
        sessionID: '123',
        socket: socketMock,
      };
  
      init(socketSetupOptions);
  
      expect(socketMock.on).to.have.been.calledOnceWith(
        'vsds.read.all',
        sinon.match.func
      );
  
      // Simulate the vsds.read.all event
      const callback = socketMock.on.getCall(0).args[1];
      await callback();
  
      expect(socketMock.emit).to.have.been.calledOnceWith('vsds.read.all.reply');
    });
  
    test('should not set up the vsds.read.all listener when connection is false', function () {
      const socketSetupOptions = {
        connection: false,
        sessionID: '123',
        socket: socketMock,
      };
  
      init(socketSetupOptions);
  
      expect(socketMock.on).to.not.have.been.called;
      expect(socketMock.emit).to.not.have.been.called;
    });
  
    test('should not set up the vsds.read.all listener when sessionID is missing', function () {
      const socketSetupOptions = {
        connection: true,
        sessionID: null,
        socket: socketMock,
      };
  
      init(socketSetupOptions);
  
      expect(socketMock.on).to.not.have.been.called;
      expect(socketMock.emit).to.not.have.been.called;
    });
  
    test('should not set up the vsds.read.all listener when socket is missing', function () {
      const socketSetupOptions = {
        connection: true,
        sessionID: '123',
        socket: null,
      };
  
      init(socketSetupOptions);
  
      expect(socketMock.on).to.not.have.been.called;
      expect(socketMock.emit).to.not.have.been.called;
    });
  });
  
  \`\`\`javascript
  `;
}
