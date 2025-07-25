// eslint-disable-next-line max-classes-per-file
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import {
  createComponentFactory, mockProvider, Spectator,
} from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { MockApiService } from 'app/core/testing/classes/mock-api.service';
import { mockCall, mockApi } from 'app/core/testing/utils/mock-api.utils';
import { mockAuth } from 'app/core/testing/utils/mock-auth.utils';
import { CloudSyncProviderName } from 'app/enums/cloudsync-provider.enum';
import { CloudSyncCredential } from 'app/interfaces/cloudsync-credential.interface';
import { CloudSyncProvider } from 'app/interfaces/cloudsync-provider.interface';
import { DialogService } from 'app/modules/dialog/dialog.service';
import { IxSelectHarness } from 'app/modules/forms/ix-forms/components/ix-select/ix-select.harness';
import { IxFormHarness } from 'app/modules/forms/ix-forms/testing/ix-form.harness';
import { SlideInRef } from 'app/modules/slide-ins/slide-in-ref';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { ApiService } from 'app/modules/websocket/api.service';
import {
  BaseProviderFormComponent,
} from 'app/pages/credentials/backup-credentials/cloud-credentials-form/provider-forms/base-provider-form';
import {
  S3ProviderFormComponent,
} from 'app/pages/credentials/backup-credentials/cloud-credentials-form/provider-forms/s3-provider-form/s3-provider-form.component';
import { StorjProviderFormComponent } from 'app/pages/credentials/backup-credentials/cloud-credentials-form/provider-forms/storj-provider-form/storj-provider-form.component';
import {
  TokenProviderFormComponent,
} from 'app/pages/credentials/backup-credentials/cloud-credentials-form/provider-forms/token-provider-form/token-provider-form.component';
import { CloudSyncProviderDescriptionComponent } from 'app/pages/data-protection/cloudsync/cloudsync-provider-description/cloudsync-provider-description.component';
import { storjProvider } from 'app/pages/data-protection/cloudsync/cloudsync-wizard/cloudsync-wizard.testing.utils';
import { CloudCredentialsFormComponent } from './cloud-credentials-form.component';

jest.mock('./provider-forms/s3-provider-form/s3-provider-form.component', () => {
  return {
    S3ProviderFormComponent: Component({
      selector: 'ix-s3-provider-form',
      template: '',
    })(class {
      provider: CloudSyncProvider;
      formPatcher$ = {
        next: jest.fn(),
      };

      getFormSetter$ = jest.fn(() => this.formPatcher$);
      getSubmitAttributes = jest.fn(() => ({
        s3attribute: 's3 value',
      })) as BaseProviderFormComponent['getSubmitAttributes'];

      beforeSubmit = jest.fn(() => of(true)) as BaseProviderFormComponent['beforeSubmit'];
      form = {
        get invalid(): boolean {
          return false;
        },
      } as Partial<FormGroup>;
    }),
  };
});

jest.mock('./provider-forms/token-provider-form/token-provider-form.component', () => {
  return {
    TokenProviderFormComponent: Component({
      selector: 'ix-token-provider-form',
      template: '',
    })(class {
      provider: CloudSyncProvider;
    }),
  };
});

describe('CloudCredentialsFormComponent', () => {
  let spectator: Spectator<CloudCredentialsFormComponent>;
  let loader: HarnessLoader;
  let form: IxFormHarness;
  const s3Provider = {
    name: CloudSyncProviderName.AmazonS3,
    title: 'Amazon S3',
  } as CloudSyncProvider;
  const boxProvider = {
    name: CloudSyncProviderName.Box,
    title: 'Box',
  } as CloudSyncProvider;
  const fakeCloudSyncCredential = {
    id: 233,
    name: 'My backup server',
    provider: {
      type: CloudSyncProviderName.AmazonS3,
      hostname: 'backup.com',
    },
  } as CloudSyncCredential;

  const getData = jest.fn(() => ({ existingCredential: fakeCloudSyncCredential }));
  const slideInRef = {
    close: jest.fn(),
    getData: jest.fn((): undefined => undefined),
    requireConfirmationWhen: jest.fn(),
  };

  const createComponent = createComponentFactory({
    component: CloudCredentialsFormComponent,
    providers: [
      mockProvider(SnackbarService),
      mockProvider(DialogService),
      mockProvider(SlideInRef, slideInRef),
      mockApi([
        mockCall('cloudsync.credentials.query', []),
        mockCall('cloudsync.credentials.create', fakeCloudSyncCredential),
        mockCall('cloudsync.credentials.update', fakeCloudSyncCredential),
        mockCall('cloudsync.credentials.verify', {
          valid: true,
        }),
        mockCall('cloudsync.providers', [s3Provider, boxProvider, storjProvider]),
      ]),
      mockAuth(),
    ],
  });

  describe('rendering', () => {
    beforeEach(async () => {
      spectator = createComponent();
      loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      form = await loader.getHarness(IxFormHarness);
    });

    it('loads a list of providers and shows them in Provider select', async () => {
      expect(spectator.inject(ApiService).call).toHaveBeenCalledWith('cloudsync.providers');

      const providersSelect = await form.getControl('Provider') as IxSelectHarness;
      expect(await providersSelect.getOptionLabels()).toEqual(['Amazon S3', 'Box', 'Storj']);
    });

    it('renders dynamic provider specific form when Provider is selected', async () => {
      const providersSelect = await form.getControl('Provider') as IxSelectHarness;
      await providersSelect.setValue('Amazon S3');

      const providerForm = spectator.query(S3ProviderFormComponent)!;
      expect(providerForm).toBeTruthy();
      expect(providerForm.provider).toBe(s3Provider);
    });

    it('checks storj provider specific form and description when Provider is selected', async () => {
      const providersSelect = await form.getControl('Provider') as IxSelectHarness;
      await providersSelect.setValue('Storj');

      const providerForm = spectator.query(StorjProviderFormComponent)!;
      expect(providerForm).toBeTruthy();
      expect(providerForm.provider).toBe(storjProvider);
      expect(spectator.query(CloudSyncProviderDescriptionComponent)).toBeTruthy();
    });

    it('renders a token only form for some providers', async () => {
      const providersSelect = await form.getControl('Provider') as IxSelectHarness;
      await providersSelect.setValue('Box');

      const providerForm = spectator.query(TokenProviderFormComponent)!;
      expect(providerForm).toBeTruthy();
      expect(providerForm.provider).toBe(boxProvider);
    });

    describe('verification', () => {
      it('verifies entered values when user presses Verify', async () => {
        await form.fillForm({
          Name: 'New sync',
          Provider: 'Amazon S3',
        });

        const verifyButton = await loader.getHarness(MatButtonHarness.with({ text: 'Verify Credential' }));
        await verifyButton.click();

        expect(spectator.inject(ApiService).call).toHaveBeenCalledWith('cloudsync.credentials.verify', [{
          type: CloudSyncProviderName.AmazonS3,
          s3attribute: 's3 value',
        }]);
      });

      it('calls beforeSubmit before verifying entered values', async () => {
        await form.fillForm({
          Name: 'New sync',
          Provider: 'Amazon S3',
        });

        const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Verify Credential' }));
        await saveButton.click();

        const providerForm = spectator.query(S3ProviderFormComponent)!;
        expect(providerForm.beforeSubmit).toHaveBeenCalled();
      });

      it('shows an error when verification fails', async () => {
        const websocketMock = spectator.inject(MockApiService);
        websocketMock.mockCall('cloudsync.credentials.verify', {
          valid: false,
          excerpt: 'Missing some important field',
          error: 'Some error',
        });

        await form.fillForm({
          Name: 'New sync',
          Provider: 'Amazon S3',
        });

        const verifyButton = await loader.getHarness(MatButtonHarness.with({ text: 'Verify Credential' }));
        await verifyButton.click();

        expect(spectator.inject(DialogService).error).toHaveBeenCalledWith({
          title: 'Error',
          message: 'Missing some important field',
          stackTrace: expect.anything(),
        });
      });
    });

    describe('saving', () => {
      it('calls beforeSubmit before saving form', async () => {
        await form.fillForm({
          Name: 'New sync',
          Provider: 'Amazon S3',
        });

        const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
        await saveButton.click();

        const providerForm = spectator.query(S3ProviderFormComponent)!;
        expect(providerForm.beforeSubmit).toHaveBeenCalled();
      });

      it('saves new credentials when new form is saved', async () => {
        await form.fillForm({
          Name: 'New sync',
          Provider: 'Amazon S3',
        });

        const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
        await saveButton.click();

        expect(spectator.inject(ApiService).call).toHaveBeenCalledWith('cloudsync.credentials.create', [{
          name: 'New sync',
          provider: {
            type: CloudSyncProviderName.AmazonS3,
            s3attribute: 's3 value',
          },
        }]);
        expect(slideInRef.close).toHaveBeenCalledWith({ response: fakeCloudSyncCredential });
        expect(spectator.inject(SnackbarService).success).toHaveBeenCalled();
      });

      it('sets default name when provider is selected and name field has not been touched by the user', async () => {
        await form.fillForm({
          Provider: 'Amazon S3',
        });
        expect(await form.getValues()).toMatchObject({
          Name: 'Amazon S3',
        });

        await form.fillForm({
          Provider: 'Box',
        });
        expect(await form.getValues()).toMatchObject({
          Name: 'Box',
        });

        await form.fillForm(
          {
            Name: 'My Box',
            Provider: 'Amazon S3',
          },
        );

        expect(await form.getValues()).toEqual({
          Name: 'My Box',
          Provider: 'Amazon S3',
        });
      });
    });
  });

  describe('saving with credentials', () => {
    beforeEach(async () => {
      spectator = createComponent({
        providers: [
          mockProvider(SlideInRef, {
            ...slideInRef,
            getData,
          }),
        ],
      });
      loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      form = await loader.getHarness(IxFormHarness);
    });

    it('shows existing values when form is opened for edit', async () => {
      spectator.component.setCredentialsForEdit();

      const commonFormValues = await form.getValues();
      expect(commonFormValues).toEqual({
        Name: 'My backup server',
        Provider: 'Amazon S3',
      });

      const providerForm = spectator.query(S3ProviderFormComponent)!;
      expect(providerForm).toBeTruthy();
      expect(providerForm.getFormSetter$().next).toHaveBeenCalledWith({
        type: CloudSyncProviderName.AmazonS3,
        hostname: 'backup.com',
      });
    });

    it('updates existing credentials when edit form is saved', async () => {
      spectator.component.setCredentialsForEdit();

      await form.fillForm({
        Name: 'My updated server',
      });

      const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
      await saveButton.click();

      expect(spectator.inject(ApiService).call).toHaveBeenCalledWith('cloudsync.credentials.update', [
        233,
        {
          name: 'My updated server',
          provider: {
            type: CloudSyncProviderName.AmazonS3,
            s3attribute: 's3 value',
          },
        },
      ]);
      expect(slideInRef.close).toHaveBeenCalledWith({ response: fakeCloudSyncCredential });
      expect(spectator.inject(SnackbarService).success).toHaveBeenCalled();
    });
  });
});
