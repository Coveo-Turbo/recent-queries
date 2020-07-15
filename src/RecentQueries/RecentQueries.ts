import {
  l,
  logCustomEvent,
  state,
  $$,
  LocalStorageUtils,
  IQuerySuccessEventArgs,
  QueryEvents,
  IComponentBindings,
  ComponentOptions,
  Component,
  Initialization,
  OmniboxEvents,
  IPopulateOmniboxSuggestionsEventArgs,
  IOmniboxSuggestion } from 'coveo-search-ui';
import { lazyComponent } from '@coveops/turbo-core';

export interface IRecentQueriesOptions {
  caption?: string;
  numberOfQueries?: number;
  isStandalone?: boolean;
  useCookies?: boolean;
  showInQuerySuggest?: boolean;
}

@lazyComponent
export class RecentQueries extends Component {
  static ID = 'RecentQueries';

  static options: IRecentQueriesOptions = {
    caption: ComponentOptions.buildStringOption({ defaultValue: 'Recent Queries' }),
    numberOfQueries: ComponentOptions.buildNumberOption({ defaultValue: 5 }),
    isStandalone: ComponentOptions.buildBooleanOption({ defaultValue: false }),
    useCookies: ComponentOptions.buildBooleanOption({ defaultValue: false }),
    showInQuerySuggest: ComponentOptions.buildBooleanOption({ defaultValue: true })
  };

  private queriesList: string[] = [];
  private queriesListHTMLElement: HTMLElement | null = null;
  private localStorage: any;
  private expDate: Date;
  private refreshList: boolean = true;
  private suggestedSearchExist: boolean = true;

  constructor(public element: HTMLElement, public options: IRecentQueriesOptions, public bindings: IComponentBindings) {
    super(element, RecentQueries.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(element, RecentQueries, options);

    this.hide();
    this.bind.onRootElement(QueryEvents.querySuccess, (args: IQuerySuccessEventArgs) => this.handleQuerySuccess(args));

    if (this.options.showInQuerySuggest) {
      Coveo.$$(document.body).on(OmniboxEvents['querySuggestRendered'], (e: Event) => this.handleQuerySuggestRendered(e));
      this.bind.onRootElement(OmniboxEvents.querySuggestSuccess, (args: IQuerySuccessEventArgs) => this.handleQuerySuggestSuccess(args));
      this.bind.onRootElement(OmniboxEvents.populateOmniboxSuggestions, (args: IPopulateOmniboxSuggestionsEventArgs) => this.handleQuerySuggestions(args));
    } else {
      this.element.appendChild(this.build());
    }

    this.initQueryStorage();
  }

  private initQueryStorage() {
    if (this.options.useCookies) {
      this.expDate = new Date()
      this.expDate.setMonth(this.expDate.getMonth() + 1);
      this.queriesList = this.getRecentQueriesCookie() || [];
    } else {
      this.localStorage = new LocalStorageUtils('RecentQueries');
      this.queriesList = JSON.parse(this.localStorage.load()) || [];
    }

    if (this.options.isStandalone) {
      this.buildPreviousQueries(this.queriesList);
      if (this.queriesList.length > 0) {
        this.show();
      }
    }
  }

  private hide() {
    $$(this.element).addClass('hidden');
  }

  private show() {
    $$(this.element).removeClass('hidden');
  }

  private handleQuerySuccess(args: IQuerySuccessEventArgs) {
    const query = args.queryBuilder.expression.build();
    if (this.refreshList && args.results.results.length > 0) {
      this.show();
      this.updateQueriesList(query);
    } else {
      this.hide();
    }

    $$(this.element).toggleClass('hidden', this.queriesList.length === 0);
    this.refreshList = true;
  }

  private handleQuerySuggestSuccess(args: IQuerySuccessEventArgs){
    if (args['completions'].length == 0) {
      this.suggestedSearchExist = false;
    } else {
      this.suggestedSearchExist = true;
    }
  }

  private handleQuerySuggestions(args: IPopulateOmniboxSuggestionsEventArgs) {
    if (args.omnibox.getText() !== '') {
      args.suggestions.push(this.getPreviousQueriesForOmnibox());
      this.suggestedSearchExist = true;
    }

    $$(this.element).toggleClass('hidden', this.queriesList.length === 0);
    this.refreshList = true;
  }

  private handleQuerySuggestRendered(e: Event) {
    // Modify the Suggested Search Results line
    let recentSearchesLabel = document.querySelector(`.magic-box-suggestion.coveo-omnibox-selectable[aria-label="${Coveo.l('Recent Queries')}"]`);
    if (recentSearchesLabel) {
      recentSearchesLabel.classList.add('recent-queries-disabled-line');
      recentSearchesLabel.classList.remove('coveo-omnibox-selectable');
    }
    if (this.suggestedSearchExist) {
      // Add the Suggested Search Results line
      let omniboxItem = Coveo.$$('div', { class: 'magic-box-suggestion coveo-omnibox-selectable' });
      let label = Coveo.$$('div', { class: 'coveo-omnibox-suggested-search-label' }, Coveo.l('Suggested Search Results'));
      omniboxItem.append(label.el);
      let magicboxSuggestionDiv = document.querySelector('#coveo-magicbox-suggestions');
      if (magicboxSuggestionDiv) {
        magicboxSuggestionDiv.insertBefore(omniboxItem.el, document.querySelector('#coveo-magicbox-suggestions').firstChild);
      }
    }
  }

  private getPreviousQueriesForOmnibox(): Promise<IOmniboxSuggestion[]> {
    return new Promise<IOmniboxSuggestion[]>((resolve) => {
      let shownQueries: IOmniboxSuggestion[] = new Array<IOmniboxSuggestion>();

      shownQueries.push({
        html: `<div class="coveo-recent-searches-label">${Coveo.l('Recent Queries')}</div>`,
        text: '',
        index: 0
      });

      _.each(this.queriesList, query => {
        let item = this.buildOmniboxPreviousQueries(query);
        shownQueries.push(item);
      })

      resolve(shownQueries);
    });
  }

  private buildOmniboxPreviousQueries(query: string): Coveo.Suggestion {
    const el = $$('div');

    const suggestion_el = Coveo.$$('div', { class: 'coveo-omnibox-previous-queries' });
    const span = Coveo.$$('span', {}, query);
    suggestion_el.append(span.el);
    el.append(suggestion_el.el);

    var suggest = <IOmniboxSuggestion>{
      html: el.el.outerHTML,
      text: query,
      index: 0,
    }
    return suggest;
  }

  private handleHistoryClick(expression: string) {
    this.refreshList = false;
    state(this.root, 'q', expression);
    this.queryController.deferExecuteQuery({
      beforeExecuteQuery: () => {
        logCustomEvent(
          this.root,
          { name: 'searchFromHistory', type: 'customEventType' },
          {
            queryHistory: expression
          }
        );
      }
    });
    this.updateQueriesList(expression);
  }

  private updateQueriesList(query: string) {
    this.queriesList = _.chain(this.queriesList)
      .unshift(query)
      .compact()
      .uniq()
      .first(this.options.numberOfQueries)
      .value();

    if (this.options.useCookies) {
      document.cookie = `recent_queries=${JSON.stringify(this.queriesList)};expires=${this.expDate.toUTCString()};path=/`
    } else {
      this.localStorage.save(JSON.stringify(this.queriesList));
    }

    this.buildPreviousQueries(this.queriesList);
  }

  private removeFromQueriesList(query: string) {
    this.queriesList = _.chain(this.queriesList)
      .without(query)
      .compact()
      .uniq()
      .last(this.options.numberOfQueries + 1)
      .value();

    if (this.options.useCookies) {
      document.cookie = `recent_queries=${JSON.stringify(this.queriesList)};domain=.maximintegrated.com;expires=${this.expDate.toUTCString()};path=/`
    } else {
      this.localStorage.save(JSON.stringify(this.queriesList));
    }

    this.buildPreviousQueries(this.queriesList);
  }

  public build(): HTMLElement {
    const element = $$('div');

    this.queriesListHTMLElement = $$('ol', { class: 'queries-history-list' }).el;

    element.append(this.buildPanelHeading());
    element.append(this.queriesListHTMLElement);

    return element.el;
  }

  public buildPanelHeading(): HTMLElement {
    const panelHeading = $$('div', { className: 'coveo-panel-heading' });
    const caption = $$('span', { className: 'caption-for-queries-history' }, this.options.caption || l('Recent Queries'));

    panelHeading.append($$('i', { className: 'fas fa-history' }).el);
    panelHeading.append(caption.el);

    return panelHeading.el;
  }

  public buildPreviousQueries(list: any[]) {
    if (!this.options.showInQuerySuggest) {
      if (this.queriesListHTMLElement) {
        this.queriesListHTMLElement.innerHTML = '';
        _.each(this.queriesList, expression => {
          const listItemCaption = $$('div', { className: 'queries-history-item-caption', title: expression }, expression);
          const removeFromList = $$('div', { className: 'queries-history-remove' }, 'x');

          const that = this;
          removeFromList.el.addEventListener('click', function (e) {
            that.removeFromQueriesList(expression);
            e.cancelBubble = true;
            e.preventDefault();
          });

          const listItem = $$('li');
          listItem.append(listItemCaption.el);
          listItem.append(removeFromList.el);

          listItem.on('click', () => this.handleHistoryClick(expression));

          $$(this.queriesListHTMLElement as HTMLElement).append(listItem.el);
        });
      } else {
        this.logger.error('queriesListHTMLElement is null');
      }
    }
  }

  private getRecentQueriesCookie(): any {
    let cookies = document.cookie;
    for (let cookie of cookies.split(';')) {
      if (cookie.indexOf('recent_queries=') != -1) {
        return JSON.parse(cookie.replace('recent_queries=', ''));
      }
    }
    return undefined;
  }

}

Initialization.registerAutoCreateComponent(RecentQueries);
