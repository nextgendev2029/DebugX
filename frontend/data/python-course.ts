// ── Python Course Data ──────────────────────────────────────────────
// All 9 modules with sections, code examples, and MCQs

export interface MCQOption {
    text: string;
    isCorrect: boolean;
}

export interface MCQ {
    question: string;
    codeSnippet?: string;
    options: MCQOption[];
}

export interface CodeExample {
    code: string;
    output?: string;
    description?: string;
}

export interface Section {
    id: string;
    title: string;
    content: string[];
    keyPoints?: string[];
    importantNotes?: string[];
    codeExamples: CodeExample[];
    table?: { headers: string[]; rows: string[][] };
    mcqs: MCQ[];
}

export interface Module {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    icon: string;
    sections: Section[];
}

export interface Track {
    id: string;
    title: string;
    language: string;
    description: string;
    totalModules: number;
    totalSections: number;
    totalMCQs: number;
    modules: Module[];
}

// ── Module 1: Introduction to Python & Basics ────────────────────

const module1: Module = {
    id: "1",
    number: 1,
    title: "Introduction to Python & Basics",
    subtitle: "Get started with Python",
    description: "Learn what Python is, how to install it, work with variables, data types, input/output, and type casting.",
    color: "#22c55e",
    icon: "",
    sections: [
        {
            id: "1.1",
            title: "What is Python?",
            content: [
                "Python is a high-level, interpreted programming language designed to be simple and easy to read.",
                "It is widely used in web development, automation, data analysis, and artificial intelligence.",
            ],
            keyPoints: [
                "Easy syntax (close to English)",
                "Interpreted (no compilation step required)",
                "Cross-platform",
                "Large community support",
            ],
            codeExamples: [
                {
                    code: 'print("Hello, World!")',
                    output: "Hello, World!",
                    description: "This is a Python program that prints text on the screen.",
                },
            ],
            mcqs: [
                {
                    question: "Python is:",
                    options: [
                        { text: "Low-level language", isCorrect: false },
                        { text: "High-level language", isCorrect: true },
                        { text: "Assembly language", isCorrect: false },
                        { text: "Machine language", isCorrect: false },
                    ],
                },
                {
                    question: "Python is:",
                    options: [
                        { text: "Compiled", isCorrect: false },
                        { text: "Interpreted", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "1.2",
            title: "Installing Python & Running Code",
            content: [
                "To start coding in Python, you need Python installed on your system and a code editor (VS Code / PyCharm).",
            ],
            keyPoints: [
                "Interactive mode: type `python` in terminal",
                "Script mode: run `python file.py`",
            ],
            codeExamples: [
                {
                    code: 'print("Python is running!")',
                    output: "Python is running!",
                },
            ],
            mcqs: [
                {
                    question: "Which command runs a Python file?",
                    options: [
                        { text: "run file.py", isCorrect: false },
                        { text: "python file.py", isCorrect: true },
                        { text: "execute file", isCorrect: false },
                        { text: "start file", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "1.3",
            title: "Variables",
            content: [
                "A variable is used to store data. In Python, you do not need to declare the type explicitly.",
            ],
            keyPoints: [
                "Cannot start with a number",
                "No spaces allowed",
                "Case-sensitive",
            ],
            codeExamples: [
                {
                    code: 'x = 10\nname = "Tuhin"',
                    description: "x stores an integer, name stores a string.",
                },
            ],
            mcqs: [
                {
                    question: "Which is a valid variable name?",
                    options: [
                        { text: "1name", isCorrect: false },
                        { text: "name_1", isCorrect: true },
                        { text: "name-1", isCorrect: false },
                        { text: "name 1", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "1.4",
            title: "Data Types",
            content: [
                "Python supports multiple data types including integers, floats, strings, and booleans.",
            ],
            table: {
                headers: ["Type", "Example"],
                rows: [
                    ["int", "10"],
                    ["float", "3.14"],
                    ["str", '"hello"'],
                    ["bool", "True"],
                ],
            },
            codeExamples: [
                {
                    code: 'x = 5          # int\ny = 2.5        # float\nname = "Hi"    # string\nflag = True    # boolean\n\nprint(type(x))',
                    output: "<class 'int'>",
                },
            ],
            mcqs: [
                {
                    question: "What is the type of 3.0?",
                    options: [
                        { text: "int", isCorrect: false },
                        { text: "float", isCorrect: true },
                        { text: "str", isCorrect: false },
                        { text: "bool", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "1.5",
            title: "Input and Output",
            content: [
                "Python allows user input using input() and output using print().",
                "input() always returns a string. Type conversion is required for numbers.",
            ],
            importantNotes: [
                "input() always returns a string",
                "Type conversion is required for numbers: age = int(input(\"Enter age: \"))",
            ],
            codeExamples: [
                {
                    code: 'name = input("Enter your name: ")\nprint("Hello", name)',
                    description: "Takes user input and prints a greeting.",
                },
            ],
            mcqs: [
                {
                    question: "What does input() return?",
                    options: [
                        { text: "int", isCorrect: false },
                        { text: "float", isCorrect: false },
                        { text: "str", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "1.6",
            title: "Type Casting",
            content: [
                "Type casting converts one data type into another.",
            ],
            codeExamples: [
                {
                    code: 'x = "10"\ny = int(x)\n\nprint(y + 5)',
                    output: "15",
                },
            ],
            mcqs: [
                {
                    question: 'What will this output?\nint("5") + 2',
                    options: [
                        { text: '"52"', isCorrect: false },
                        { text: "7", isCorrect: true },
                        { text: "error", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

// ── Module 2: Operators & Expressions ────────────────────────────

const module2: Module = {
    id: "2",
    number: 2,
    title: "Operators & Expressions",
    subtitle: "Master Python operators",
    description: "Learn arithmetic, comparison, logical, assignment operators and operator precedence.",
    color: "#eab308",
    icon: "",
    sections: [
        {
            id: "2.1",
            title: "Arithmetic Operators",
            content: [
                "Used for mathematical operations.",
            ],
            table: {
                headers: ["Operator", "Meaning"],
                rows: [
                    ["+", "Addition"],
                    ["-", "Subtraction"],
                    ["*", "Multiplication"],
                    ["/", "Division"],
                    ["//", "Floor division"],
                    ["%", "Modulus"],
                    ["**", "Power"],
                ],
            },
            codeExamples: [
                {
                    code: "a = 10\nb = 3\n\nprint(a + b)   # 13\nprint(a // b)  # 3\nprint(a % b)   # 1",
                    output: "13\n3\n1",
                },
            ],
            mcqs: [
                {
                    question: "What is 10 % 3?",
                    options: [
                        { text: "3", isCorrect: false },
                        { text: "1", isCorrect: true },
                        { text: "0", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "2.2",
            title: "Comparison Operators",
            content: [
                "Used to compare values. They return True or False.",
            ],
            table: {
                headers: ["Operator", "Meaning"],
                rows: [
                    ["==", "Equal"],
                    ["!=", "Not equal"],
                    [">", "Greater"],
                    ["<", "Less"],
                ],
            },
            codeExamples: [
                {
                    code: "print(5 > 3)   # True\nprint(2 == 2)  # True",
                    output: "True\nTrue",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?\nprint(4 != 4)",
                    options: [
                        { text: "True", isCorrect: false },
                        { text: "False", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "2.3",
            title: "Logical Operators",
            content: [
                "Used to combine conditions.",
            ],
            table: {
                headers: ["Operator", "Meaning"],
                rows: [
                    ["and", "Both true"],
                    ["or", "At least one true"],
                    ["not", "Reverse"],
                ],
            },
            codeExamples: [
                {
                    code: "print(True and False)  # False\nprint(True or False)   # True",
                    output: "False\nTrue",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?\nTrue or False and False",
                    options: [
                        { text: "True", isCorrect: true },
                        { text: "False", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "2.4",
            title: "Operator Precedence",
            content: [
                "Order in which operations are executed.",
            ],
            keyPoints: [
                "() — Highest priority",
                "**",
                "*, /",
                "+, — Lowest priority",
            ],
            codeExamples: [
                {
                    code: "print(2 + 3 * 4)   # 14\nprint((2 + 3) * 4) # 20",
                    output: "14\n20",
                },
            ],
            mcqs: [
                {
                    question: "Output of:\n2 + 2 * 2",
                    options: [
                        { text: "8", isCorrect: false },
                        { text: "6", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "2.5",
            title: "Assignment Operators",
            content: [
                "Used to assign values to variables.",
            ],
            table: {
                headers: ["Operator", "Example"],
                rows: [
                    ["=", "x = 5"],
                    ["+=", "x += 2"],
                    ["-=", "x -= 1"],
                ],
            },
            codeExamples: [
                {
                    code: "x = 5\nx += 3\nprint(x)",
                    output: "8",
                },
            ],
            mcqs: [
                {
                    question: "x = 4\nx *= 2\nOutput?",
                    options: [
                        { text: "6", isCorrect: false },
                        { text: "8", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// ── Module 3: Control Flow ───────────────────────────────────────

const module3: Module = {
    id: "3",
    number: 3,
    title: "Control Flow",
    subtitle: "Decision making & loops",
    description: "Master if/else, elif ladders, nested conditions, for/while loops, break and continue.",
    color: "#eab308",
    icon: "",
    sections: [
        {
            id: "3.1",
            title: "if Statement",
            content: [
                "The if statement is used to execute code only when a condition is true.",
            ],
            codeExamples: [
                {
                    code: 'age = 18\n\nif age >= 18:\n    print("You are eligible to vote")',
                    output: "You are eligible to vote",
                    description: "If the condition is true, the block runs.",
                },
            ],
            mcqs: [
                {
                    question: "What will be the output?",
                    codeSnippet: 'x = 10\nif x > 5:\n    print("A")',
                    options: [
                        { text: "A", isCorrect: true },
                        { text: "Nothing", isCorrect: false },
                        { text: "Error", isCorrect: false },
                    ],
                },
                {
                    question: "Which keyword is used for condition checking?",
                    options: [
                        { text: "check", isCorrect: false },
                        { text: "if", isCorrect: true },
                        { text: "condition", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "3.2",
            title: "if-else Statement",
            content: [
                "Used when you want to handle both true and false cases.",
            ],
            codeExamples: [
                {
                    code: 'num = 7\n\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
                    output: "Odd",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: 'x = 3\nif x > 5:\n    print("A")\nelse:\n    print("B")',
                    options: [
                        { text: "A", isCorrect: false },
                        { text: "B", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "3.3",
            title: "if-elif-else Ladder",
            content: [
                "Used when multiple conditions need to be checked.",
            ],
            importantNotes: [
                "Conditions are checked top to bottom",
                "First true condition executes",
            ],
            codeExamples: [
                {
                    code: 'marks = 75\n\nif marks >= 90:\n    print("A")\nelif marks >= 70:\n    print("B")\nelse:\n    print("C")',
                    output: "B",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: 'x = 85\nif x >= 90:\n    print("A")\nelif x >= 80:\n    print("B")\nelse:\n    print("C")',
                    options: [
                        { text: "A", isCorrect: false },
                        { text: "B", isCorrect: true },
                        { text: "C", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "3.4",
            title: "Nested if",
            content: [
                "An if inside another if allows for more complex decision making.",
            ],
            codeExamples: [
                {
                    code: 'x = 10\n\nif x > 5:\n    if x < 15:\n        print("Between 5 and 15")',
                    output: "Between 5 and 15",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: 'x = 20\n\nif x > 10:\n    if x < 15:\n        print("A")\n    else:\n        print("B")',
                    options: [
                        { text: "A", isCorrect: false },
                        { text: "B", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "3.5",
            title: "for Loop",
            content: [
                "Used to iterate over a sequence (list, range, string).",
            ],
            codeExamples: [
                {
                    code: "for i in range(5):\n    print(i)",
                    output: "0\n1\n2\n3\n4",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "for i in range(2, 5):\n    print(i)",
                    options: [
                        { text: "2 3 4", isCorrect: true },
                        { text: "1 2 3", isCorrect: false },
                        { text: "2 3 4 5", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "3.6",
            title: "while Loop",
            content: [
                "Repeats execution as long as condition is true.",
            ],
            importantNotes: [
                "Always update the loop variable, otherwise infinite loop.",
            ],
            codeExamples: [
                {
                    code: "i = 0\n\nwhile i < 3:\n    print(i)\n    i += 1",
                    output: "0\n1\n2",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "i = 1\nwhile i <= 3:\n    print(i)\n    i += 1",
                    options: [
                        { text: "1 2 3", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "3.7",
            title: "break and continue",
            content: [
                "break → exits the loop entirely",
                "continue → skips the current iteration and moves to the next",
            ],
            codeExamples: [
                {
                    code: "for i in range(5):\n    if i == 3:\n        break\n    print(i)",
                    output: "0\n1\n2",
                    description: "break exits the loop when i equals 3.",
                },
                {
                    code: "for i in range(5):\n    if i == 2:\n        continue\n    print(i)",
                    output: "0\n1\n3\n4",
                    description: "continue skips printing when i equals 2.",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "for i in range(3):\n    if i == 1:\n        continue\n    print(i)",
                    options: [
                        { text: "0 1 2", isCorrect: false },
                        { text: "0 2", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// ── Module 4: Data Structures ────────────────────────────────────

const module4: Module = {
    id: "4",
    number: 4,
    title: "Data Structures",
    subtitle: "Core collections",
    description: "Learn about lists, tuples, sets, dictionaries and their operations.",
    color: "#3b82f6",
    icon: "",
    sections: [
        {
            id: "4.1",
            title: "Lists",
            content: [
                "A list is an ordered, mutable collection.",
            ],
            codeExamples: [
                {
                    code: "numbers = [1, 2, 3, 4]\n\nprint(numbers[0])  # Access\nnumbers[1] = 10    # Modify",
                    output: "1",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "a = [1,2,3]\nprint(a[-1])",
                    options: [
                        { text: "1", isCorrect: false },
                        { text: "3", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "4.2",
            title: "List Methods",
            content: [
                "Common operations on lists: append(), pop(), insert().",
            ],
            codeExamples: [
                {
                    code: "a = [1,2]\n\na.append(3)\nprint(a)  # [1,2,3]\n\na.pop()\nprint(a)  # [1,2]",
                    output: "[1, 2, 3]\n[1, 2]",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "a = [1,2]\na.append(5)\nprint(len(a))",
                    options: [
                        { text: "2", isCorrect: false },
                        { text: "3", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "4.3",
            title: "Tuples",
            content: [
                "A tuple is an ordered but immutable collection.",
            ],
            importantNotes: [
                "You cannot change elements of a tuple after creation.",
            ],
            codeExamples: [
                {
                    code: "t = (1, 2, 3)\nprint(t[0])",
                    output: "1",
                },
            ],
            mcqs: [
                {
                    question: "Which is true?",
                    options: [
                        { text: "Tuple is mutable", isCorrect: false },
                        { text: "Tuple is immutable", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "4.4",
            title: "Sets",
            content: [
                "A set stores unique elements only. Duplicates are automatically removed.",
            ],
            codeExamples: [
                {
                    code: "s = {1, 2, 2, 3}\nprint(s)",
                    output: "{1, 2, 3}",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?\nset([1,1,2])",
                    options: [
                        { text: "[1,2]", isCorrect: false },
                        { text: "{1,2}", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "4.5",
            title: "Dictionaries",
            content: [
                "Stores data in key-value pairs.",
            ],
            codeExamples: [
                {
                    code: 'd = {\n    "name": "Tuhin",\n    "age": 20\n}\n\nprint(d["name"])',
                    output: "Tuhin",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: 'd = {"a":1}\nprint(d.get("a"))',
                    options: [
                        { text: "1", isCorrect: true },
                        { text: "None", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "4.6",
            title: "List vs Tuple vs Set vs Dict",
            content: [
                "Understanding the differences between Python's core collection types.",
            ],
            table: {
                headers: ["Type", "Ordered", "Mutable", "Unique"],
                rows: [
                    ["List", "Yes", "Yes", "No"],
                    ["Tuple", "Yes", "No", "No"],
                    ["Set", "No", "Yes", "Yes"],
                    ["Dict", "Yes", "Yes", "Keys unique"],
                ],
            },
            codeExamples: [],
            mcqs: [
                {
                    question: "Which stores key-value pairs?",
                    options: [
                        { text: "List", isCorrect: false },
                        { text: "Tuple", isCorrect: false },
                        { text: "Dictionary", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// ── Module 5: Functions ──────────────────────────────────────────

const module5: Module = {
    id: "5",
    number: 5,
    title: "Functions",
    subtitle: "Core logic building",
    description: "Define functions, use parameters, return values, default/keyword arguments, lambdas, and recursion.",
    color: "#a855f7",
    icon: "",
    sections: [
        {
            id: "5.1",
            title: "What is a Function?",
            content: [
                "A function is a block of reusable code designed to perform a specific task.",
                "Instead of writing the same code again and again, we use functions.",
            ],
            codeExamples: [
                {
                    code: 'def greet():\n    print("Hello!")\n\ngreet()',
                    output: "Hello!",
                },
            ],
            mcqs: [
                {
                    question: "What keyword is used to define a function?",
                    options: [
                        { text: "func", isCorrect: false },
                        { text: "def", isCorrect: true },
                        { text: "function", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "5.2",
            title: "Parameters and Arguments",
            content: [
                "Functions can take input values called parameters.",
            ],
            keyPoints: [
                "Parameter → variable in function definition",
                "Argument → value passed during function call",
            ],
            codeExamples: [
                {
                    code: 'def greet(name):\n    print("Hello", name)\n\ngreet("Tuhin")',
                    output: "Hello Tuhin",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "def add(a, b):\n    return a + b\n\nprint(add(2,3))",
                    options: [
                        { text: "5", isCorrect: true },
                        { text: "23", isCorrect: false },
                        { text: "Error", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "5.3",
            title: "Return Statement",
            content: [
                "return is used to send a value back from the function.",
            ],
            importantNotes: [
                "Without return, function returns None.",
            ],
            codeExamples: [
                {
                    code: "def square(x):\n    return x * x\n\nresult = square(4)\nprint(result)",
                    output: "16",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "def f():\n    pass\n\nprint(f())",
                    options: [
                        { text: "0", isCorrect: false },
                        { text: "None", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "5.4",
            title: "Default Parameters",
            content: [
                "You can assign default values to parameters.",
            ],
            codeExamples: [
                {
                    code: 'def greet(name="User"):\n    print("Hello", name)\n\ngreet()',
                    output: "Hello User",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "def f(x=10):\n    return x\n\nprint(f())",
                    options: [
                        { text: "10", isCorrect: true },
                        { text: "Error", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "5.5",
            title: "Keyword Arguments",
            content: [
                "You can pass arguments using parameter names, regardless of order.",
            ],
            codeExamples: [
                {
                    code: 'def greet(name, age):\n    print(name, age)\n\ngreet(age=20, name="Tuhin")',
                    output: "Tuhin 20",
                },
            ],
            mcqs: [
                {
                    question: 'Is this valid?\ngreet(age=20, name="A")',
                    options: [
                        { text: "Yes", isCorrect: true },
                        { text: "No", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "5.6",
            title: "Lambda Functions",
            content: [
                "A lambda function is a small anonymous function (no name).",
            ],
            codeExamples: [
                {
                    code: "square = lambda x: x * x\nprint(square(3))",
                    output: "9",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "f = lambda x: x + 2\nprint(f(3))",
                    options: [
                        { text: "5", isCorrect: true },
                        { text: "6", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "5.7",
            title: "Recursion",
            content: [
                "Recursion is when a function calls itself. Used for problems like factorial, trees, etc.",
            ],
            importantNotes: [
                "Must have a base case to prevent infinite recursion.",
            ],
            codeExamples: [
                {
                    code: "def fact(n):\n    if n == 0:\n        return 1\n    return n * fact(n-1)\n\nprint(fact(4))",
                    output: "24",
                    description: "Factorial using recursion: 4 × 3 × 2 × 1 = 24",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: "def f(n):\n    if n == 1:\n        return 1\n    return n * f(n-1)\n\nprint(f(3))",
                    options: [
                        { text: "6", isCorrect: true },
                        { text: "3", isCorrect: false },
                        { text: "Error", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

// ── Module 6: Strings ────────────────────────────────────────────

const module6: Module = {
    id: "6",
    number: 6,
    title: "Strings",
    subtitle: "Deep handling",
    description: "Work with string indexing, slicing, methods, concatenation, formatting, and immutability.",
    color: "#f97316",
    icon: "",
    sections: [
        {
            id: "6.1",
            title: "What is a String?",
            content: [
                "A string is a sequence of characters enclosed in quotes.",
            ],
            codeExamples: [
                {
                    code: 'name = "Python"\nprint(name)',
                    output: "Python",
                },
            ],
            mcqs: [
                {
                    question: "Which is a string?",
                    options: [
                        { text: "10", isCorrect: false },
                        { text: '"Hello"', isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "6.2",
            title: "String Indexing",
            content: [
                "Each character in a string has an index. Indexing starts from 0. Negative indexing starts from -1 (last character).",
            ],
            codeExamples: [
                {
                    code: 's = "Python"\n\nprint(s[0])  # P\nprint(s[-1]) # n',
                    output: "P\nn",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: 's = "abc"\nprint(s[1])',
                    options: [
                        { text: "a", isCorrect: false },
                        { text: "b", isCorrect: true },
                        { text: "c", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "6.3",
            title: "String Slicing",
            content: [
                "Extract parts of a string using slicing syntax: string[start:end].",
            ],
            codeExamples: [
                {
                    code: 's = "Python"\n\nprint(s[0:3])',
                    output: "Pyt",
                },
            ],
            mcqs: [
                {
                    question: "What is the output?",
                    codeSnippet: 's = "hello"\nprint(s[1:4])',
                    options: [
                        { text: "hel", isCorrect: false },
                        { text: "ell", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "6.4",
            title: "String Methods",
            content: [
                "Common methods: lower(), upper(), strip(), replace().",
            ],
            codeExamples: [
                {
                    code: 's = " Hello "\n\nprint(s.strip())     # "Hello"\nprint(s.lower())     # " hello "',
                    output: 'Hello\n hello ',
                },
            ],
            mcqs: [
                {
                    question: 'What is the output?\n"abc".upper()',
                    options: [
                        { text: "ABC", isCorrect: true },
                        { text: "abc", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "6.5",
            title: "String Concatenation",
            content: [
                "Joining strings using the + operator.",
            ],
            codeExamples: [
                {
                    code: 'a = "Hello"\nb = "World"\n\nprint(a + " " + b)',
                    output: "Hello World",
                },
            ],
            mcqs: [
                {
                    question: 'What is the output?\nprint("A" + "B")',
                    options: [
                        { text: "AB", isCorrect: true },
                        { text: "A B", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "6.6",
            title: "String Formatting",
            content: [
                "Used to insert variables into strings using f-strings.",
            ],
            codeExamples: [
                {
                    code: 'name = "Tuhin"\nage = 20\n\nprint(f"My name is {name} and I am {age}")',
                    output: "My name is Tuhin and I am 20",
                },
            ],
            mcqs: [
                {
                    question: "What is f-string used for?",
                    options: [
                        { text: "Loop", isCorrect: false },
                        { text: "Formatting text with variables", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "6.7",
            title: "Strings are Immutable",
            content: [
                "Strings cannot be changed after creation. You cannot modify individual characters.",
            ],
            codeExamples: [
                {
                    code: 's = "hello"\n# s[0] = "H"  -- This will cause an error',
                    description: "Attempting to modify a string character raises a TypeError.",
                },
            ],
            mcqs: [
                {
                    question: "Strings are:",
                    options: [
                        { text: "Mutable", isCorrect: false },
                        { text: "Immutable", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// ── Module 7: File Handling ──────────────────────────────────────

const module7: Module = {
    id: "7",
    number: 7,
    title: "File Handling",
    subtitle: "Working with files",
    description: "Open, read, write files, use different modes, and learn best practices with the `with` statement.",
    color: "#ef4444",
    icon: "",
    sections: [
        {
            id: "7.1",
            title: "Why File Handling?",
            content: [
                "File handling allows you to store data permanently, read data from files, and write data to files.",
                "Without file handling, all data is lost when the program ends.",
            ],
            keyPoints: [
                "Saving user data",
                "Logs",
                "Reports",
            ],
            codeExamples: [],
            mcqs: [
                {
                    question: "Why do we use file handling?",
                    options: [
                        { text: "To store data temporarily", isCorrect: false },
                        { text: "To store data permanently", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "7.2",
            title: "Opening a File",
            content: [
                "To work with files, we first open them using open().",
            ],
            table: {
                headers: ["Mode", "Meaning"],
                rows: [
                    ['"r"', "Read"],
                    ['"w"', "Write (overwrite)"],
                    ['"a"', "Append"],
                ],
            },
            codeExamples: [
                {
                    code: 'f = open("test.txt", "r")',
                    description: "Opens the file in read mode.",
                },
            ],
            mcqs: [
                {
                    question: "Which mode is used to read a file?",
                    options: [
                        { text: "w", isCorrect: false },
                        { text: "r", isCorrect: true },
                        { text: "a", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "7.3",
            title: "Reading Files",
            content: [
                "You can read file content using read(), readline(), or readlines().",
            ],
            importantNotes: [
                "Always close the file after use with f.close().",
            ],
            codeExamples: [
                {
                    code: 'f = open("test.txt", "r")\ndata = f.read()\nprint(data)\nf.close()',
                },
            ],
            mcqs: [
                {
                    question: "What does read() return?",
                    options: [
                        { text: "Integer", isCorrect: false },
                        { text: "String", isCorrect: true },
                        { text: "List", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "7.4",
            title: "Writing Files",
            content: [
                "Used to write data into files.",
            ],
            importantNotes: [
                '"w" overwrites the file',
                '"a" adds to the file',
            ],
            codeExamples: [
                {
                    code: 'f = open("test.txt", "w")\nf.write("Hello")\nf.close()',
                },
            ],
            mcqs: [
                {
                    question: "Which mode will not delete existing content?",
                    options: [
                        { text: "w", isCorrect: false },
                        { text: "a", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "7.5",
            title: "Using with (Best Practice)",
            content: [
                "Using `with` automatically closes the file when the block ends.",
            ],
            codeExamples: [
                {
                    code: 'with open("test.txt", "r") as f:\n    data = f.read()\n    print(data)',
                },
            ],
            mcqs: [
                {
                    question: "Why use with?",
                    options: [
                        { text: "Faster execution", isCorrect: false },
                        { text: "Auto close file", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// ── Module 8: Exception Handling ─────────────────────────────────

const module8: Module = {
    id: "8",
    number: 8,
    title: "Exception Handling",
    subtitle: "Error control",
    description: "Handle runtime errors gracefully with try-except, specific exceptions, else, finally, and raise.",
    color: "#171717",
    icon: "",
    sections: [
        {
            id: "8.1",
            title: "What is an Exception?",
            content: [
                "An exception is an error that occurs during program execution.",
            ],
            codeExamples: [
                {
                    code: "print(10 / 0)",
                    description: "This causes a ZeroDivisionError.",
                },
            ],
            mcqs: [
                {
                    question: "What is an exception?",
                    options: [
                        { text: "Syntax", isCorrect: false },
                        { text: "Runtime error", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "8.2",
            title: "try-except",
            content: [
                "Used to handle errors and prevent program crash.",
            ],
            codeExamples: [
                {
                    code: 'try:\n    x = int("abc")\nexcept:\n    print("Error occurred")',
                    output: "Error occurred",
                },
            ],
            mcqs: [
                {
                    question: "What does the try block do?",
                    options: [
                        { text: "Handles error", isCorrect: false },
                        { text: "Contains risky code", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "8.3",
            title: "Handling Specific Exceptions",
            content: [
                "You can catch specific errors for more precise handling.",
            ],
            codeExamples: [
                {
                    code: 'try:\n    x = int("abc")\nexcept ValueError:\n    print("Invalid conversion")',
                    output: "Invalid conversion",
                },
            ],
            mcqs: [
                {
                    question: "Which exception occurs for invalid int conversion?",
                    options: [
                        { text: "TypeError", isCorrect: false },
                        { text: "ValueError", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "8.4",
            title: "else and finally",
            content: [
                "else → runs if no error occurs",
                "finally → always runs regardless of error",
            ],
            codeExamples: [
                {
                    code: 'try:\n    x = 10 / 2\nexcept:\n    print("Error")\nelse:\n    print("Success")\nfinally:\n    print("Done")',
                    output: "Success\nDone",
                },
            ],
            mcqs: [
                {
                    question: "finally block runs:",
                    options: [
                        { text: "Only on error", isCorrect: false },
                        { text: "Always", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "8.5",
            title: "Raising Exceptions",
            content: [
                "You can manually create exceptions using raise.",
            ],
            codeExamples: [
                {
                    code: 'x = -1\n\nif x < 0:\n    raise ValueError("Negative not allowed")',
                    description: "Raises a ValueError with a custom message.",
                },
            ],
            mcqs: [
                {
                    question: "What does raise do?",
                    options: [
                        { text: "Ignores error", isCorrect: false },
                        { text: "Creates error", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// ── Module 9: Object-Oriented Programming ────────────────────────

const module9: Module = {
    id: "9",
    number: 9,
    title: "Object-Oriented Programming",
    subtitle: "OOP fundamentals",
    description: "Understand classes, objects, constructors, encapsulation, inheritance, polymorphism, and abstraction.",
    color: "#3b82f6",
    icon: "",
    sections: [
        {
            id: "9.1",
            title: "What is OOP?",
            content: [
                "Object-Oriented Programming (OOP) is a programming paradigm where we organize code using objects and classes.",
                "Instead of writing everything in functions, we group related data and behavior together.",
            ],
            keyPoints: [
                "Properties → variables (e.g., color, brand, speed)",
                "Actions → methods (e.g., drive(), brake())",
            ],
            codeExamples: [],
            mcqs: [
                {
                    question: "OOP is based on:",
                    options: [
                        { text: "Functions", isCorrect: false },
                        { text: "Objects and Classes", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "9.2",
            title: "Classes and Objects",
            content: [
                "A class is a blueprint. An object is an instance of that class.",
            ],
            codeExamples: [
                {
                    code: 'class Car:\n    brand = "Toyota"\n\ncar1 = Car()\nprint(car1.brand)',
                    output: "Toyota",
                    description: "Car is the class, car1 is the object.",
                },
            ],
            mcqs: [
                {
                    question: "What is an object?",
                    options: [
                        { text: "Blueprint", isCorrect: false },
                        { text: "Instance of class", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "9.3",
            title: "__init__ (Constructor)",
            content: [
                "The constructor initializes object data when a new instance is created.",
            ],
            keyPoints: [
                "self → refers to the current object",
                "Data is stored inside the object using self.variable",
            ],
            codeExamples: [
                {
                    code: 'class Car:\n    def __init__(self, brand):\n        self.brand = brand\n\ncar1 = Car("BMW")\nprint(car1.brand)',
                    output: "BMW",
                },
            ],
            mcqs: [
                {
                    question: "What does __init__ do?",
                    options: [
                        { text: "Deletes object", isCorrect: false },
                        { text: "Initializes object", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "9.4",
            title: "Instance Variables & Methods",
            content: [
                "Instance variables → data inside an object",
                "Methods → functions inside a class",
            ],
            codeExamples: [
                {
                    code: 'class Student:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        print("Hello", self.name)\n\ns1 = Student("Tuhin")\ns1.greet()',
                    output: "Hello Tuhin",
                },
            ],
            mcqs: [
                {
                    question: "What is self?",
                    options: [
                        { text: "Global variable", isCorrect: false },
                        { text: "Current object reference", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "9.5",
            title: "Encapsulation",
            content: [
                "Encapsulation means restricting access to data.",
                "Public → normal variables, Private → __variable (name mangling).",
            ],
            codeExamples: [
                {
                    code: "class Bank:\n    def __init__(self, balance):\n        self.__balance = balance\n\n    def get_balance(self):\n        return self.__balance\n\nb = Bank(1000)\nprint(b.get_balance())",
                    output: "1000",
                },
            ],
            mcqs: [
                {
                    question: "Encapsulation is:",
                    options: [
                        { text: "Data hiding", isCorrect: true },
                        { text: "Looping", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "9.6",
            title: "Inheritance",
            content: [
                "Inheritance allows one class to reuse another class's properties and methods.",
            ],
            codeExamples: [
                {
                    code: 'class Animal:\n    def speak(self):\n        print("Animal speaks")\n\nclass Dog(Animal):\n    pass\n\nd = Dog()\nd.speak()',
                    output: "Animal speaks",
                    description: "Dog inherits the speak() method from Animal.",
                },
            ],
            mcqs: [
                {
                    question: "Inheritance is used for:",
                    options: [
                        { text: "Code reuse", isCorrect: true },
                        { text: "Debugging", isCorrect: false },
                    ],
                },
            ],
        },
        {
            id: "9.7",
            title: "Method Overriding",
            content: [
                "A child class can override (replace) a parent class method.",
            ],
            codeExamples: [
                {
                    code: 'class Animal:\n    def speak(self):\n        print("Animal sound")\n\nclass Dog(Animal):\n    def speak(self):\n        print("Bark")\n\nd = Dog()\nd.speak()',
                    output: "Bark",
                },
            ],
            mcqs: [
                {
                    question: "Overriding means:",
                    options: [
                        { text: "Copy method", isCorrect: false },
                        { text: "Replace method", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "9.8",
            title: "Polymorphism",
            content: [
                "Same method behaves differently for different objects.",
            ],
            codeExamples: [
                {
                    code: 'class Cat:\n    def sound(self):\n        print("Meow")\n\nclass Dog:\n    def sound(self):\n        print("Bark")\n\nfor animal in [Cat(), Dog()]:\n    animal.sound()',
                    output: "Meow\nBark",
                },
            ],
            mcqs: [
                {
                    question: "Polymorphism means:",
                    options: [
                        { text: "Same behavior", isCorrect: false },
                        { text: "Same method, different behavior", isCorrect: true },
                    ],
                },
            ],
        },
        {
            id: "9.9",
            title: "Abstraction",
            content: [
                "Abstraction means hiding complex logic and showing only necessary parts.",
                "Think of it like driving a car — you don't need to know engine internals.",
            ],
            codeExamples: [],
            mcqs: [
                {
                    question: "Abstraction is:",
                    options: [
                        { text: "Showing everything", isCorrect: false },
                        { text: "Hiding complexity", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

// ── Assemble the Python Track ────────────────────────────────────

const allModules = [module1, module2, module3, module4, module5, module6, module7, module8, module9];

const totalSections = allModules.reduce((sum, m) => sum + m.sections.length, 0);
const totalMCQs = allModules.reduce(
    (sum, m) => sum + m.sections.reduce((s, sec) => s + sec.mcqs.length, 0),
    0
);

export const pythonTrack: Track = {
    id: "python",
    title: "Python Fundamentals",
    language: "Python",
    description:
        "A comprehensive beginner-to-intermediate Python course covering basics, operators, control flow, data structures, functions, strings, file handling, exception handling, and OOP.",
    totalModules: allModules.length,
    totalSections: totalSections,
    totalMCQs: totalMCQs,
    modules: allModules,
};

export const allTracks: Track[] = [pythonTrack];
