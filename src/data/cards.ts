import { CARDS, NATIONAL10, getCard, type Card } from './compatBase';

export type CardRecord = Card;
export const CARD_CATALOG = CARDS;
export const NATIONAL_CARD_IDS = NATIONAL10;
export const cardById = getCard;

export const regionalCards = () =>
  CARD_CATALOG.filter((card) => card.group !== 'national');
