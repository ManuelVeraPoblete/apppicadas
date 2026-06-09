export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PlaceNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Local con id "${id}" no encontrado`);
  }
}

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Usuario "${identifier}" no encontrado`);
  }
}

export class ReviewNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Reseña con id "${id}" no encontrada`);
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(message = 'No tienes permiso para realizar esta acción') {
    super(message);
  }
}

export class DuplicateResourceException extends DomainException {
  constructor(resource: string) {
    super(`Ya existe un recurso "${resource}" con esos datos`);
  }
}
