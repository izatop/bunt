import {ITransport} from "../interfaces.js";
import {QueueAbstract} from "./QueueAbstract.js";

export class Queue<Q extends ITransport> extends QueueAbstract<Q> {

}
