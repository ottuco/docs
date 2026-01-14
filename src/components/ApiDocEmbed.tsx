import React, {useMemo} from 'react';
import {Provider} from 'react-redux';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {ungzip} from 'pako';
import {createAuth} from '@theme/ApiExplorer/Authorization/slice';
import {createPersistanceMiddleware} from '@theme/ApiExplorer/persistanceMiddleware';
import {
  createStoreWithState,
  createStoreWithoutState,
} from '@theme/ApiItem/store';

type ApiDocEmbedProps = {
  content: React.ComponentType<any> & {frontMatter?: Record<string, any>};
};

const statusRegex = new RegExp('(20[0-9]|2[1-9][0-9])');

const base64ToUint8Array = (base64: string) => {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
  }

  return new Uint8Array();
};

const parseApi = (encoded?: string) => {
  if (!encoded) {
    return null;
  }

  try {
    const bytes = base64ToUint8Array(encoded);
    const json = new TextDecoder().decode(ungzip(bytes));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const ApiDocEmbed = ({content: Content}: ApiDocEmbedProps) => {
  const isBrowser = useIsBrowser();
  const {siteConfig} = useDocusaurusContext();
  const options = siteConfig?.themeConfig?.api;
  const api = useMemo(() => parseApi(Content?.frontMatter?.api), [Content]);

  const store = useMemo(() => {
    const persistanceMiddleware = createPersistanceMiddleware(options);

    if (!isBrowser || !api) {
      return createStoreWithoutState({}, [persistanceMiddleware]);
    }

    const responses = (api?.responses ?? {}) as Record<string, any>;
    let acceptArray: string[] = [];
    for (const [code, content] of Object.entries(responses)) {
      if (statusRegex.test(code)) {
        acceptArray.push(...Object.keys(content?.content ?? {}));
      }
    }
    acceptArray = acceptArray.flat();

    const requestBodyContent = api?.requestBody?.content ?? {};
    const contentTypeArray = Object.keys(requestBodyContent);
    const servers = api?.servers ?? [];
    const params = {
      path: [],
      query: [],
      header: [],
      cookie: [],
    } as Record<string, any[]>;

    api?.parameters?.forEach((param: {in: string}) => {
      const paramsArray = params[param.in];
      if (paramsArray) {
        paramsArray.push(param);
      }
    });

    const auth = createAuth({
      security: api?.security,
      securitySchemes: api?.securitySchemes,
      options,
    });

    const serverRaw = window.sessionStorage.getItem('server');
    const serverObject = serverRaw ? JSON.parse(serverRaw) : {};

    return createStoreWithState(
      {
        accept: {
          value: acceptArray[0],
          options: acceptArray,
        },
        contentType: {
          value: contentTypeArray[0],
          options: contentTypeArray,
        },
        server: {
          value: serverObject.url ? serverObject : undefined,
          options: servers,
        },
        response: {value: undefined},
        body: {type: 'empty'},
        params,
        auth,
      },
      [persistanceMiddleware]
    );
  }, [api, isBrowser, options]);

  if (!Content) {
    return null;
  }

  return (
    <Provider store={store}>
      <Content />
    </Provider>
  );
};

export default ApiDocEmbed;
