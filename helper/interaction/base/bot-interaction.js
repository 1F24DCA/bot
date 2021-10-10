export default class BotInteraction {
	static #interactionList = [];
	static empty() {
		BotInteraction.#interactionList = [];
	}
	static add(command, reaction) {
		BotInteraction.#interactionList.push({
			command: command,
			reaction: reaction
		});
	}

	#botHelper = null;
	getBotHelper() { return this.#botHelper; }

	constructor(botHelper) {
		this.#botHelper = botHelper;
	}

	onMessage(message, caller) {
		let result = null;

		const platform = this.getBotHelper().getInformation().getPlatform();
		const bot = this.getBotHelper().getBot();

		BotInteraction.#interactionList.forEach(interaction => {
			interaction.command.forEach(knownCommand => {
				if (result !== null) return; // result가 정해졌다면 모든 forEach문 생략
				
				const inputArguments = message.split(' ');
				const inputCommand = inputArguments.shift();

				if (knownCommand.match('^(.+?):.+$')) {
					const emotePlatform = /^(.+?):.+$/g.exec(knownCommand)[1];
					if (emotePlatform === platform) {
						knownCommand = knownCommand.replace(`${emotePlatform}:`, '');
					} else { return; } // 타 플랫폼의 명령어는 무시 (foreach element 하나를 빠져나감)
				}

				if (typeof this.emote !== undefined) {
					const emote = this.emote(knownCommand);
					if (typeof emote === 'string' && emote.length > 0) {
						knownCommand = `${emote}`;
					}
				}

				if (inputCommand === knownCommand) {
					const info = {
						[platform]: bot,
						args: inputArguments,
						caller: caller
					};
					
					result = interaction.reaction(info, this);
				}
			});
		});

		return result;
	}
}