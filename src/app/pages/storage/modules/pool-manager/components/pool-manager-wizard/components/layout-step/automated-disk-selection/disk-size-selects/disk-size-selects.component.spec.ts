import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ReactiveFormsModule } from '@angular/forms';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { Subject } from 'rxjs';
import { GiB } from 'app/constants/bytes.constant';
import { DiskType } from 'app/enums/disk-type.enum';
import { VDevType } from 'app/enums/v-dev-type.enum';
import { DetailsDisk } from 'app/interfaces/disk.interface';
import { IxCheckboxHarness } from 'app/modules/forms/ix-forms/components/ix-checkbox/ix-checkbox.harness';
import { IxSelectHarness } from 'app/modules/forms/ix-forms/components/ix-select/ix-select.harness';
import {
  DiskSizeSelectsComponent,
} from 'app/pages/storage/modules/pool-manager/components/pool-manager-wizard/components/layout-step/automated-disk-selection/disk-size-selects/disk-size-selects.component';
import { PoolManagerStore } from 'app/pages/storage/modules/pool-manager/store/pool-manager.store';

describe('DiskSizeSelectsComponent', () => {
  let spectator: Spectator<DiskSizeSelectsComponent>;
  let loader: HarnessLoader;
  let diskSizeSelect: IxSelectHarness;
  const startOver$ = new Subject<void>();
  const resetStep$ = new Subject<void>();

  const inventoryDisks = [
    { type: DiskType.Hdd, size: 10 * GiB, name: 'disk1' },
    { type: DiskType.Hdd, size: 10 * GiB, name: 'disk2' },
    { type: DiskType.Hdd, size: 20 * GiB, name: 'disk3' },
    { type: DiskType.Ssd, size: 20 * GiB, name: 'disk4' },
  ] as DetailsDisk[];

  const createComponent = createComponentFactory({
    component: DiskSizeSelectsComponent,
    imports: [
      ReactiveFormsModule,
    ],
    providers: [
      mockProvider(PoolManagerStore, {
        startOver$,
        resetStep$,
      }),
    ],
  });

  beforeEach(async () => {
    spectator = createComponent({
      props: {
        type: VDevType.Spare,
        inventory: inventoryDisks,
        isStepActive: true,
      },
    });
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    diskSizeSelect = await loader.getHarness(IxSelectHarness.with({ label: 'Disk Size' }));

    jest.spyOn(spectator.component.disksSelected, 'emit');
  });

  describe('disk type and size', () => {
    it('shows dropdown with disk types and sizes', async () => {
      const options = await diskSizeSelect.getOptionLabels();
      expect(options).toEqual(['10 GiB (HDD)', '20 GiB (HDD)', '20 GiB (SSD)']);
    });

    it('updates value in store when disk type/size is selected', async () => {
      await diskSizeSelect.setValue('20 GiB (HDD)');

      expect(spectator.inject(PoolManagerStore).setTopologyCategoryDiskSizes).toHaveBeenCalledWith(
        VDevType.Spare,
        {
          diskType: DiskType.Hdd,
          diskSize: 20 * GiB,
          treatDiskSizeAsMinimum: false,
        },
      );
    });

    it('emits (disksSelected) when dropdown is updated', async () => {
      await diskSizeSelect.setValue('10 GiB (HDD)');

      expect(spectator.component.disksSelected.emit).toHaveBeenLastCalledWith([
        { type: DiskType.Hdd, size: 10 * GiB, name: 'disk1' },
        { type: DiskType.Hdd, size: 10 * GiB, name: 'disk2' },
      ]);
    });
  });

  describe('Treat Disk Size as Minimum', () => {
    it('does not show Treat Disk Size as Minimum until disk size is selected', async () => {
      const minimumCheckbox = await loader.getHarnessOrNull(IxCheckboxHarness.with({ label: 'Treat Disk Size as Minimum' }));
      expect(minimumCheckbox).toBeNull();
    });

    it('does not show Treat Disk Size as Minimum unless users selects a disk when larger disks are available', async () => {
      await diskSizeSelect.setValue('20 GiB (HDD)');

      const minimumCheckbox = await loader.getHarnessOrNull(IxCheckboxHarness.with({ label: 'Treat Disk Size as Minimum' }));
      expect(minimumCheckbox).toBeNull();

      await diskSizeSelect.setValue('10 GiB (HDD)');
      expect(await loader.getHarness(IxCheckboxHarness.with({ label: 'Treat Disk Size as Minimum' }))).toBeTruthy();
    });

    it('updates value in store when Treat as minimum is changed', async () => {
      await diskSizeSelect.setValue('10 GiB (HDD)');

      const minimumCheckbox = await loader.getHarness(IxCheckboxHarness.with({ label: 'Treat Disk Size as Minimum' }));
      await minimumCheckbox.setValue(true);

      expect(spectator.inject(PoolManagerStore).setTopologyCategoryDiskSizes).toHaveBeenLastCalledWith(
        VDevType.Spare,
        {
          diskSize: 10 * GiB,
          diskType: DiskType.Hdd,
          treatDiskSizeAsMinimum: true,
        },
      );
    });

    it('emits (disksSelected) when checkbox is ticked', async () => {
      await diskSizeSelect.setValue('10 GiB (HDD)');
      const minimumCheckbox = await loader.getHarnessOrNull(IxCheckboxHarness.with({ label: 'Treat Disk Size as Minimum' }));
      await minimumCheckbox.setValue(true);

      expect(spectator.component.disksSelected.emit).toHaveBeenCalledWith(inventoryDisks);
    });
  });

  it('selects disk size and type if there only one option available', async () => {
    const singleDisk = { type: DiskType.Hdd, size: 10 * GiB, name: 'disk1' } as DetailsDisk;
    spectator.setInput('inventory', [singleDisk]);

    expect(await diskSizeSelect.getValue()).toBe('10 GiB (HDD)');
    expect(spectator.inject(PoolManagerStore).setTopologyCategoryDiskSizes).toHaveBeenCalledWith(
      VDevType.Spare,
      {
        diskType: DiskType.Hdd,
        diskSize: 10 * GiB,
        treatDiskSizeAsMinimum: false,
      },
    );
    expect(spectator.component.disksSelected.emit).toHaveBeenCalledWith([singleDisk]);
  });

  it('resets to default values when store emits a reset event', async () => {
    await diskSizeSelect.setValue('10 GiB (HDD)');
    let minimumCheckbox = await loader.getHarness(IxCheckboxHarness.with({ label: 'Treat Disk Size as Minimum' }));
    await minimumCheckbox.setValue(true);

    startOver$.next();

    expect(await diskSizeSelect.getValue()).toBe('');

    minimumCheckbox = await loader.getHarnessOrNull(IxCheckboxHarness.with({ label: 'Treat Disk Size as Minimum' }));
    expect(minimumCheckbox).toBeNull();
  });
});
