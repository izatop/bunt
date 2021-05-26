import {command} from "../route";
import {BaseCommand} from "./BaseCommand";

class UpdateLintCommand extends BaseCommand {
    public async run() {
        const {store} = this.context;
        const resource = await store.getResource("lint/.eslintrc");

        const result = await store.writeToPackageRoot(resource);
        this.logger.info(`File ${result} has been updated`);
    }
}

export default command(UpdateLintCommand, "lint:update");
