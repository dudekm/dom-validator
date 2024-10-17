# DOM Validator

This project fetches the DOM of multiple URLs using Puppeteer, validates the HTML, and saves the validation results with detailed error messages in CSV format.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/dudekm/dom-validator.git
    ```

2. **Navigate to the project directory**:

    ```bash
    cd dom-validator
    ```

3. **Install the dependencies**:

    ```bash
    npm install
    ```

## Usage

### Configuration

The script accepts three parameters from the command line:

1. **URL list file**: A `.txt` file with one URL per line.
2. **Output CSV file**: The file where validation results and details will be saved.
3. **Concurrency**: The number of URLs to process concurrently.

### Example URL list file (`urls.txt`):

```
https://example.com
https://another-example.com
https://example.org
```


### Running the project

Once you have installed the dependencies and created your `urls.txt` file, you can run the project using the following command:

```bash
node index.js <urls.txt> <output.csv> <concurrency>
```

### Example:

```bash
node index.js urls.txt output.csv 5
```

The output CSV file will have the following format:

```bash
url;status;details
https://example.com;valid;No errors
https://another-example.com;invalid;Line 10, col 5: Element “div” not allowed as child of element “span” (rule: "element-name")
```
