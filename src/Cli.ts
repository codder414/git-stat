import { Command } from './Command';
import * as yargs from 'yargs';

export class Cli {
	private _commands: Command[] = [];
	private _validationErrors: Error[] = [];
	private cli: typeof yargs = yargs;

	public get yargs(): typeof yargs {
		return this.cli;
	}
	public add(required?: boolean, ...args: ConstructorParameters<typeof Command>) {
		const command = new Command(...args);
		command.cli = this.cli;
		command.init();
		if (required) {
			command.required = true;
		}
		this._commands.push(command);
		return command;
	}
	public async run(): Promise<void> {
		try {
			this._sortByDependent();
			for (let index in this._commands) {
				await this._commands[index].handle.call(this._commands[index]);
			}
		} catch (err) {
			this._validationErrors.push(err);
			this._printErrors();
			process.exit(1);
		}
	}
	private _printErrors() {
		this._validationErrors.forEach((error) => console.log(error));
	}
	public getCommand(name: string): InstanceType<typeof Command> {
		const result = this._commands.filter((command) => command.getName() === name);
		if (result.length <= 0) {
			throw new Error(`Command with name: ${name} not found!`);
		}
		return result[0];
	}

	public _sortByDependent() {
		this._commands.sort((a, b) => {
			if (a.dependent !== null && a.dependent.getName() === b.getName()) {
				return 1;
			} else if (b.dependent !== null && b.dependent.getName() === a.getName()) {
				return -1;
			} else {
				return 0;
			}
		});
	}

	public getValues() {
		return Object.assign(
			{},
			this._commands.reduce((acc, command) => {
				acc[command.getName()] = command.getValue();
				return acc;
			}, Object.create(null))
		);
	}
}
