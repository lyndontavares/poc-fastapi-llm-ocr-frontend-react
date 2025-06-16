import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const ProfileSettings: React.FunctionComponent = () => {
 // useDocumentTitle("Selecionar LLM");

  return (
    <PageSection hasBodyWrapper={false}>
      <Title headingLevel="h1" size="lg">
        Selecionar LLM
      </Title>
    </PageSection>
  );

}

export { ProfileSettings };
