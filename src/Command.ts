import * as yargs from 'yargs';

export class Command {
	private _validatorFn: (self: Command) => void;
	private _transformerFn: (self: Command) => void;
	private _cli: typeof yargs;
	private _transformedValue: any;
	private _dependent: Command = null;
	public constructor(
		public name: string = '',
		public alias: string = '',
		public type: 'string' | 'number' | 'boolean'
	) {
		if (this.name === '' || this.alias === '') {
			throw new Error('name and alias properties must not be empty string');
		}
	}
	public set cli(v: typeof yargs) {
		this._cli = v;
	}
	public init() {
		if (!this._cli) {
			throw new Error('yargs is required');
		}
		this.valueType = this.type;
		this._cli.option(this.getName(), {
			alias: this.getAlias()
		});
	}
	public set defaultValue(value: any) {
		this._cli.default(this.getName(), value);
	}
	public set required(v: boolean) {
		if (v) {
			this._cli.required(this.getName(), `Option ${this.name} is required`);
		}
	}
	public set valueType(type: 'string' | 'number' | 'boolean') {
		switch (type) {
			case 'string':
				this._cli.string(this.getName());
				break;
			case 'number':
				this._cli.number(this.getName());
				break;
			case 'boolean':
				this._cli.boolean(this.getName());
				break;
			default:
				throw new Error(`Unknown type: ${type}`);
		}
	}
	getName(): string {
		return this.extractName(this.name);
	}
	getAlias(): string {
		return this.extractName(this.alias);
	}
	getInputArgs() {
		return this._cli.argv;
	}
	getInputValue(): any {
		return this._cli.argv[this.getName()];
	}
	private extractName(str: string) {
		return str.replace(/^[\-]*$/, '');
	}
	public setValidator(fn: (self: Command) => any) {
		this._validatorFn = fn.bind(this);
		return this;
	}
	public setTransformerValue(fn: (inputValue: any) => any) {
		this._transformerFn = fn.bind(this);
		return this;
	}
	public transformValue() {
		if (this._transformerFn !== undefined && this.getInputValue() !== undefined) {
			this._transformedValue = this._transformerFn.call(this, this.getInputValue());
		} else {
			this._transformedValue = this.getInputValue();
		}
	}
	public async validate() {
		if (typeof this._validatorFn === 'undefined') {
			this._validatorFn = async (self: Command) => {};
		}
		return this._validatorFn(this);
	}

	public async handle() {
		if (!(!this.required && typeof this.getInputValue() === 'undefined')) {
			try {
				await this.validate();
				return this.transformValue();
			} catch (err) {
				throw err;
			}
		}
	}

	public getValue() {
		return this._transformedValue || null;
	}
	public count() {
		this._cli.count(this.getName());
		return this;
	}

	public dependsOn(command: Command) {
		this._dependent = command;
	}

	public get dependent() {
		return this._dependent;
	}
}

function safe<T>(obj): T {
	return new Proxy(obj, {
		get: function (target, name) {
			const result = target[name];
			if (!!result) {
				return result instanceof Object ? safe(result) : result;
			}
			return safe({});
		}
	});
}
