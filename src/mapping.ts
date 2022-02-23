import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  Transfer as TransferEvent,
  MintItem as MintItemEvent,
  Cheyny as CheynyContract,
} from "../generated/Cheyny/Cheyny";
import {
  Approval,
  ApprovalForAll,
  Transfer,
  User,
  Token,
  History,
} from "../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.owner = event.params.owner;
  entity.approved = event.params.approved;
  entity.tokenId = event.params.tokenId;
  entity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.owner = event.params.owner;
  entity.operator = event.params.operator;
  entity.approved = event.params.approved;
  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;
  entity.save();

  let token = Token.load(event.params.tokenId.toString());
  let user = User.load(event.params.to.toHexString());

  if (!user) {
    let user = new User(event.params.to.toHexString());
    user.save();
  }

  if (token) {
    token.owner = event.params.to.toHexString();
    token.save();
  }

  let history = new History(event.transaction.hash.toHexString());

  history.action = "TRANSFER";
  history.createdAtTimestamp = event.block.timestamp;
  history.from = event.params.from.toHexString();
  history.to = event.params.to.toHexString();
  history.tokenID = event.params.tokenId.toString();
  history.save();
}

export function handleMintItem(event: MintItemEvent): void {
  let token = new Token(event.params.tokenId.toString());
  token.tokenID = event.params.tokenId;

  let cheynyContract = CheynyContract.bind(event.address);
  token.tokenURI = cheynyContract.tokenURI(event.params.tokenId);

  token.createdAtTimestamp = event.block.timestamp;
  token.creator = event.params.issuer.toHexString();
  token.owner = event.params.issuer.toHexString();

  token.save();

  let user = User.load(event.params.issuer.toHexString());
  let history = new History(event.transaction.hash.toHexString());

  history.action = "MINT";
  history.createdAtTimestamp = event.block.timestamp;
  history.from = event.params.issuer.toHexString();
  history.to = event.params.issuer.toHexString();
  history.tokenID = event.params.tokenId.toString();
  history.save();

  if (!user) {
    user = new User(event.params.issuer.toHexString());
    user.save();
  }
}
