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

  let token = Token.load(event.params.tokenId.toHexString());
  token!.owner = event.params.to.toHexString();
  token!.save();
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
  if (!user) {
    user = new User(event.params.issuer.toHexString());
    user.save();
  }
}
