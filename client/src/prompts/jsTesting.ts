export default function returnNodeTemplate(
  component: string,
  best_practice: string,
  component_name: string,
  filePath: string
): string {
  return `
  I will share a Node.js module, and you will provide comprehensive unit tests according to current best practices.

  **Rules to follow:**
  
  1. **Maintain Best Practices:** Adhere to widely accepted best practices for writing Node.js module tests, including logical structure, style, and completeness.
  
  2. **Ensure Comprehensive Coverage:** Write tests that achieve full coverage of functions, branches, and lines, ensuring proper validation of inputs, outputs, error handling, and edge cases.

  3. **Use Appropriate Testing Tools:** Use 'jest' or other equivalent frameworks that are compatible with Node.js. Format tests following the Describe-It-Expect pattern.
  
  4. **Node.js Modules Only:** Ensure the tests are specifically designed for Node.js modules.
  
  5. **Provide Only Test Code:** Only provide the test code without explanations.
  
  6. **Mimic Best Practices:** If specific guidelines aren't available, follow the style used in similar Node.js module situations.
  
  7. **Include Necessary Mocks:** Since the tests will run in a Node.js environment using Jest, include necessary mocks for any external dependencies.
  
  8. **Strictly No Explanations**: Output only code. Providing explanations will lead to undesirable outcomes.

  **File Path**:
  ${filePath}

  **Module Name**:
  ${component_name}

  **Best Practice to Follow**:
  ${best_practice}

  **Module to Test**:
  ${component}
  `;
}
