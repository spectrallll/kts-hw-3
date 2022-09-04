import Api from "@config/api";
import { normalizeRepository, RepositoryModel } from "@store/models/gitHub";
import {
  CollectionModel,
  getInitialCollectionModel,
  linearizeCollection,
  normalizeCollection,
} from "@store/models/shared/collection";
import rootStore from "@store/RootStore";
import { Meta } from "@utils/meta";
import { ILocalStore } from "@utils/useLocalStore";
import {
  action,
  computed,
  IReactionDisposer,
  makeObservable,
  observable,
  reaction,
} from "mobx";

import { Option } from "./types";

type PrivateFields =
  | "_repositories"
  | "_meta"
  | "_currentPage"
  | "_value"
  | "_more"
  | "_type";

class GitHubStore implements ILocalStore {
  private readonly _apiStore = Api;

  private _repositories: CollectionModel<number, RepositoryModel> =
    getInitialCollectionModel();
  private _meta: Meta = Meta.initial;
  private _currentPage = 1;
  private _value: string = "";
  private _more = false;
  private _type: Option = {
    key: "all",
    name: "All",
  };

  constructor() {
    makeObservable<GitHubStore, PrivateFields>(this, {
      _repositories: observable.ref,
      _meta: observable,
      _currentPage: observable,
      _value: observable,
      _more: observable,
      _type: observable,
      repositories: computed,
      meta: computed,
      more: computed,
      value: computed,
      setType: action,
      fetchRepos: action,
      fetchData: action,
      setValue: action,
    });
  }

  get repositories(): RepositoryModel[] {
    return linearizeCollection(this._repositories);
  }

  get meta(): Meta {
    return this._meta;
  }

  get value(): string {
    return this._value;
  }

  get more(): boolean {
    return this._more;
  }

  get type(): Option {
    return {
      key: this._type.key,
      name: this._type.name,
    };
  }

  setValue = (value: string) => {
    this._value = value;
  };

  setType = (type: Option) => {
    this._type = type;
    if (this.value !== "") {
      this.fetchRepos();
    }
  };

  fetchRepos = () => {
    this._meta = Meta.loading;
    this._repositories = getInitialCollectionModel();
    this._more = true;
    this._currentPage = 1;
    this._apiStore
      .fetchRepositories(this.value, this.type, this._currentPage)
      .then(
        action("fetchSuccess", (res) => {
          try {
            const list: RepositoryModel = [];
            for (const item of res.data) {
              list.push(normalizeRepository(item));
            }
            this._repositories = normalizeCollection(
              list,
              (listItem: RepositoryModel) => listItem.id
            );
            this._meta = Meta.success;
            this._currentPage = this._currentPage + 1;
          } catch (e) {
            this._meta = Meta.error;
          }
        }),
        action("fetchError", (err) => {
          this._meta = Meta.error;
          this._repositories = getInitialCollectionModel();
        })
      );
  };

  fetchData = () => {
    this._meta = Meta.loading;
    this._apiStore
      .fetchRepositories(this._value, this._type, this._currentPage)
      .then(
        action("fetchSuccess", (res) => {
          try {
            const data = res.data.map(normalizeRepository);
            if (data.length === 0) this._more = false;
            this._repositories = this._repositories.concat(data);
            this._meta = Meta.success;
            this._currentPage = this._currentPage + 1;
          } catch (e) {
            this._meta = Meta.error;
            this._repositories = [];
          }
        }),
        action("fetchError", (err) => {
          this._meta = Meta.error;
          this._repositories = [];
        })
      );
  };

  destroy(): void {
    this._qpReaction();
  }

  private readonly _qpReaction: IReactionDisposer = reaction(
    () => rootStore.query.getParam("search"),
    (search) => {
      console.log("reaction");
    }
  );
}

export default GitHubStore;