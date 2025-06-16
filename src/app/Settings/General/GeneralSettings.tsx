import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const GeneralSettings: React.FunctionComponent = () => {
  // useDocumentTitle("Prompt de Extração");
  return (
    <PageSection hasBodyWrapper={false}>
      <Title headingLevel="h1" size="lg">
        Prompt de Extração
      </Title>
    </PageSection>
  );
}

export { GeneralSettings };
