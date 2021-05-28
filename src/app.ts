import { Cli } from './Cli';
import execa from 'execa';
import * as fsx from 'fs-extra';
import * as path from 'path';
import Table from 'cli-table';

const log = console.log;

export async function main() {
	const app = new Cli();
	const inputCommand = app
		.add(false, 'input', 'i', 'string')
		.setValidator(async (self) => {
			await fsx.access(self.getInputValue());
			const pathToRepo = path.resolve(self.getInputValue(), '.git');
			await fsx.access(pathToRepo);
		})
		.setTransformerValue((value) => {
			return path.resolve(value);
		});
	app.add(false, 'plain', 'p', 'boolean');
	app.add(false, 'json', 'j', 'boolean');
	app.add(false, 'for-commit', 'f', 'string')
		.setValidator(async (self) => {
			try {
				const commitHash = self.getInputValue();
				await execa.command(`git cat-file -e ${commitHash}`, {
					cwd: self.dependent.getValue()
				});
			} catch (err) {
				log(err);
				throw new Error(`Commit ${self.getInputValue()} not found!`);
			}
		})
		.setTransformerValue((value) => {
			return value || null;
		})
		.dependsOn(inputCommand);
	await app.run();

	try {
		let projectPath = app.getCommand('input').getValue();
		const isPlain = app.getCommand('plain').getValue();
		const isJson = app.getCommand('json').getValue();
		const hash = app.getCommand('for-commit').getValue();
		if (!projectPath) {
			projectPath = path.resolve(process.cwd(), '.git');
			log(projectPath);
			try {
				await fsx.access(projectPath);
			} catch (err) {
				return log(
					'There is no .git directory in current directory. Please use --input[-i] option if it in another place'
				);
			}
		}

		const fields = [
			{ label: 'author', pattern: '%ae' },
			{ label: 'name', pattern: '%s' },
			{ label: 'hash', pattern: '%h' },
			{ label: 'date', pattern: '%cr' }
		];

		let gitShowResult;
		if (hash) {
			gitShowResult = await execa(
				'xargs',
				[
					'git',
					'--no-pager',
					'show',
					'--decorate=short',
					'--relative',
					`--pretty=format:">>>${fields.map((f) => f.pattern).join('|')}"`,
					'--name-only'
				],
				{ input: hash, cwd: projectPath }
			);
		} else {
			let gitLogResult = execa('git', ['--no-pager', 'log', '--decorate=short', '--pretty=format:"%H"'], {
				stdout: 'pipe',
				cwd: projectPath
			});
			gitShowResult = await execa(
				'xargs',
				[
					'git',
					'--no-pager',
					'show',
					'--decorate=short',
					'--relative',
					`--pretty=format:">>>${fields.map((f) => f.pattern).join('|')}"`,
					'--name-only'
				],
				{ input: gitLogResult.stdout, cwd: projectPath }
			);
		}
		let spliitedbyCommits = gitShowResult.stdout
			.split('>>>')
			.slice(1)
			.map((commit) => {
				let newCommit = {
					author: '',
					name: '',
					hash: '',
					date: '',
					files: []
				};
				const [msg, ...files] = commit.split('\n');
				const [author, name, hash, date] = msg.split('|');
				newCommit.author = author;
				newCommit.name = name;
				newCommit.hash = hash?.replace('"', '');
				newCommit.date = date;
				newCommit.files = files;
				return newCommit;
			});

		if (isPlain) {
			log(
				spliitedbyCommits.forEach((commit) =>
					log(`${commit.author}\t${commit.name}\t${commit.files.length}\t${commit.hash}\t${commit.date}`)
				)
			);
		} else if (isJson) {
			log(
				JSON.stringify(
					spliitedbyCommits.map((commit) => ({
						name: commit.name,
						author: commit.author,
						files: commit.files.length,
						hash: commit.hash,
						date: commit.date
					}))
				)
			);
		} else {
			const table = new Table({
				head: ['Author', 'Commit', 'Changed Files', 'hash', 'date'],
				colWidths: [50, 50, 13, 10, 20]
			});
			spliitedbyCommits.forEach((commit) =>
				table.push([commit.author, commit.name, commit.files.length, commit.hash, commit.date])
			);
			log(table.toString());
		}
	} catch (err) {
		log(err);
	}
}
