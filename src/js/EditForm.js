/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable no-console */
/* eslint-disable no-alert */
import runRequest from './Request';

export default class EditForm {
  constructor(parentWidget) {
    this.parentWidget = parentWidget;
    this.ticket = {};
    this.id = null;
    this.status = 'false';
  }

  static get ctrlId() {
    return {
      form: 'edit-form',
      title: 'form-title',
      name: 'name',
      description: 'description',
      ok: 'button-ok',
      cancel: 'button-cancel',
    };
  }

  static get markup() {
    return `
      <form>
        <label data-id="${this.ctrlId.title}">Добавить тикет</label>
        <label>Краткое описание<input type="text" name="name" data-id="${this.ctrlId.name}" required></label>
        <label>Подробное описание</label>
        <textarea name="description" data-id="${this.ctrlId.description}" rows="3" required></textarea>
        <div class="buttons">
          <button class="help-desk-button" type="reset" data-id="${this.ctrlId.cancel}">Отмена</button>
          <button class="help-desk-button" type="submit" data-id="${this.ctrlId.ok}">Ok</button>
        </div>      
      </form>
    `;
  }

  static get formSelector() {
    return `[data-widget=${this.ctrlId.form}]`;
  }

  static get titleSelector() {
    return `[data-id=${this.ctrlId.title}]`;
  }

  static get nameSelector() {
    return `[data-id=${this.ctrlId.name}]`;
  }

  static get descriptionSelector() {
    return `[data-id=${this.ctrlId.description}]`;
  }

  static get cancelSelector() {
    return `[data-id=${this.ctrlId.cancel}]`;
  }

  static get okSelector() {
    return `[data-id=${this.ctrlId.ok}]`;
  }

  bindToDOM() {
    this.container = document.createElement('div');
    this.container.className = 'help-desk-modal-form';
    this.container.dataset.widget = this.constructor.ctrlId.form;
    this.container.innerHTML = this.constructor.markup;

    document.body.appendChild(this.container);

    this.form = this.container.querySelector('form');

    this.title = this.form.querySelector(this.constructor.titleSelector);
    this.name = this.form.querySelector(this.constructor.nameSelector);
    this.description = this.form.querySelector(
      this.constructor.descriptionSelector,
    );
    this.ok = this.form.querySelector(this.constructor.okSelector);

    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.form.addEventListener('reset', this.onReset.bind(this));
    this.ok.addEventListener('click', this.validation.bind(this));
  }

  async onSubmit(event) {
    event.preventDefault();

    const method = this.id ? 'updateById' : 'createTicket';

    const data = {
      method,
      name: this.name.value.trim(),
      description: this.description.value.trim(),
      status: this.status,
    };

    if (this.id) {
      data.id = this.id;
    }

    const params = {
      data,
      responseType: 'json',
      method: 'POST',
    };

    try {
      await runRequest(params);

      this.parentWidget.redraw(await runRequest({
        data: { method: 'allTickets' },
        responseType: 'json',
        method: 'GET',
      }));
    } catch (error) {
      console.error('Error during runRequest:', error);
      alert(error);
    }

    this.onReset();
  }

  onReset() {
    this.container.classList.remove('modal-active');
  }

  validation() {
    this.name.value = this.name.value.trim();
    this.description.value = this.description.value.trim();
  }

  async show(ticket) {
    if (ticket) {
      this.title.textContent = 'Изменить тикет';
      this.id = ticket.dataset.index;

      const status = ticket.querySelector(this.parentWidget.constructor.statusSelector);
      this.status = status.textContent === '\u2713' ? 'true' : 'false';

      const name = ticket.querySelector(this.parentWidget.constructor.nameSelector);
      this.name.value = name.textContent;

      this.description.value = await this.parentWidget.constructor.getDescription(this.id);
    } else {
      this.title.textContent = 'Добавить тикет';
      this.id = null;
      this.status = 'false';
      this.name.value = '';
      this.description.value = '';
    }

    this.container.classList.add('modal-active');
  }
}
