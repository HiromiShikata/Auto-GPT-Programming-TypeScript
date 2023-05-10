import os
import subprocess
import sys
from io import StringIO
from dotenv import load_dotenv
import re

from langchain.agents import initialize_agent
from langchain.agents.tools import Tool
from langchain.chat_models import ChatOpenAI
from langchain.agents.agent_types import AgentType
from langchain.utilities import GoogleSearchAPIWrapper
from langchain.utilities import BashProcess
from langchain.callbacks import get_openai_callback
from langchain.tools import ShellTool

class TypeScriptREPL:
    def run(self, command: str) -> str:
        try:
            result = subprocess.run(
                ["npx",
                 "ts-node",
                 "-e",
                 command],
                capture_output=True,

                text=True,
                # shell=True
            )
            output = result.stdout
        except Exception as e:
            output = str(e)

        return output



class BashREPL:
    def run(self, command: str) -> str:
        try:
            result = subprocess.run(
                [
                 command],
                capture_output=True,
                text=True,
                shell=True
            )
            output = f"""
status: {result.returncode}            
stdout: {result.stdout}
stderr: {result.stderr}
            """
        except Exception as e:
            output = str(e)
        print(output)
        return output


class FileUpdater:
    def run(self, command: str) -> str:
        pattern = r"[\S\s]*file_path: *([^ ]+)\nfile_content: *([\s\S]+)$"
        match = re.search(pattern, command)
        if match:
            file_path = match.group(1)
            file_content = match.group(2)
            file_dir = os.path.dirname(file_path)
            try:
                if file_dir != '' and not os.path.exists(file_dir):
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, "w") as f:
                    f.write(file_content)
                return "File updated"
            except Exception as e:
                return str(e)
        else:
            return f"Invalid command. Command should be in the format: '{pattern}'"


class FileAppender:
    def run(self, command: str) -> str:
        pattern = r"^file_path: *([^ ]+)\nfile_content: *([\s\S]+)$"
        match = re.search(pattern, command)
        if match:
            file_path = match.group(1)
            file_content = match.group(2)
            file_dir = os.path.dirname(file_path)
            try:
                if file_dir != '' and not os.path.exists(file_dir):
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, "a") as f:
                    f.write(file_content)
                return "File updated"
            except Exception as e:
                return str(e)
        else:
            return f"Invalid command. Command should be in the format: '{pattern}'"


class FileReader:
    def run(self, command: str) -> str:
        print(command)
        if not os.path.exists(command):
            print(command)
            return "File does not exist. Please enter a valid file path."
        try:
            with open(command, "r") as f:
                return f.read()
        except Exception as e:
            return str(e)


load_dotenv()
type_script_repl = Tool("TypeScriptREPL",
                        TypeScriptREPL().run,
                        """A TypeScript Shell. Use this to execute TypeScript commands. Input should be a valid TypeScript command.
For example, "console.log('Hello, World!')" will print "Hello, World!" to the console.
If you expect output it should be printed out. 
Provide the input in normal text format instead of a code block.
""")

search = Tool("GoogleSearch",
              GoogleSearchAPIWrapper().run,
              """A Google Search. Use this to search Google. Input should be a valid Google search query.
For example, "Hello, World!" will search for "Hello, World!".
Provide the input in normal text format instead of a code block.
""")
file_updater = Tool("FileUpdater",
                    FileUpdater().run,
                    """A File Updater. Use this to update a file. Input should be a valid file path and file content.
For example, "file_path: /tmp/test.txt
file_content: Hello, World!" will create a file at "/tmp/test.txt" with the content "Hello, World!".
Provide the input in normal text format instead of a code block.
""")
file_appender = Tool("FileAppender",
                     FileAppender().run,
                     """A File Appender. Use this to append to a file. Input should be a valid file path and file content.
 For example, "file_path: /tmp/test.txt
 file_content: Hello, World!" will append "Hello, World!" to the file at "/tmp/test.txt".
Provide the input in normal text format instead of a code block.
""")
bash_repl = Tool("BashREPL",
                    BashREPL().run,
                    """A Bash Process. Use this to execute bash commands. Input should be a valid bash command.
For example, "ls -l" will list the contents of the current directory. If you expect output it should be printed out. 
Provide the input in normal text format instead of a code block.
Need to change directory always.
""")
bash_process = Tool("BashProcess",
                    BashProcess().run,
                    """A Bash Process. Use this to execute bash commands. Input should be a valid bash command.
For example, "ls -l" will list the contents of the current directory. If you expect output it should be printed out. 
Provide the input in normal text format instead of a code block.
""")
file_reader = Tool("FileReader",
                   FileReader().run,
                   """A File Reader. Use this to read a file. Input should be a valid file path.
For example, "/tmp/test.txt" will read the file at "/tmp/test.txt".
Provide the input in normal text format instead of a code block.
It won't work if you provide path with "\"" or "'" or "`".
""")

llm = ChatOpenAI(
    temperature=0.0,
    model_name="gpt-3.5-turbo",
    timeout=2 * 60 * 1000,
    request_timeout=2 * 60 * 1000,
)
shell_tool = ShellTool(description="""
A Shell Tool. Use this to execute shell commands. Input should be a valid shell command.
You need always change directory to the project directory.
e.g. "cd /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project && ls -la"
""")
agent = initialize_agent([
    type_script_repl,
    search,
    file_updater,
    # file_appender,
    # bash_process,
    # bash_repl,
    file_reader,
    shell_tool,
],
    llm,
    agent_type=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
)

promptPrimeNumber = """Could you write test code about program to determine the prime number?
File path should be primenumber.test.ts
"""

# カスタムエージェントを試す

prompt = """
Please write test code for GetUserUseCase class with jest.
Test tile path should be ./src/domain/usecases/GetUserUseCase.test.ts
This project is in /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project.

// ./src/domain/usecases/GetUserUseCase.ts
import {UserRepository} from "./adapter-interfaces/UserRepository";

export class GetUserUseCase {
    constructor(
        readonly userRepository: UserRepository,) {
    }

    execute = (id: string|null) => {
        if(!id) throw new Error('id is required')
        if(id === 'hirono'){
            throw new Error('hirono is not found')
        }
        return this.userRepository.getById(id)
    }
}


// ./src/domain/usecases/adapter-interfaces/UserRepository.ts
import {User} from "../../entities/User";

export interface UserRepository {
    create(user: User): Promise<void>
    getById(id: string): Promise<User>
}


"""

# We can use `npx jest` or `npm test` to run test.
#
# 1. Read class file and write test code.
# 1. Output test code to test file.
#
# File path of GetUserUseCase: /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.ts
# File path of test file: /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.test.ts
# """
# print("prompt:", prompt)

with get_openai_callback() as callback:
    try:
        result = agent.run(prompt)
        print("result:", result)
    except Exception as e:
        print("Exception:", e)
    print("total_cost", callback.total_cost)
    print("total_tokens:", callback.total_tokens)
    print("prompt_tokens", callback.prompt_tokens)
    print("successful_requests", callback.successful_requests)
    print("completion_tokens", callback.completion_tokens)
