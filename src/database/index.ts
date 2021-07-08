import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (host = "database"): Promise<Connection> => {
	const defaultOptions = await getConnectionOptions();

	return createConnection(
		Object.assign(defaultOptions, {
			host: process.env.NODE_ENV === "test" ? "localhost" : host,
			// Verifica se o conteudo da variavel NOD_ENV do package.json esta com apontando para test se sim usa o banco referenciado senao usa o default
			database:
				process.env.NODE_ENV === "test"
					? "fin_api_test"
					: defaultOptions.database,
		})
	);
};
