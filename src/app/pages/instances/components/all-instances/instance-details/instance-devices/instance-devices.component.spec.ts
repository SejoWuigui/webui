import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponents } from 'ng-mocks';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { VirtualizationDeviceType } from 'app/enums/virtualization.enum';
import { VirtualizationProxy, VirtualizationUsb } from 'app/interfaces/virtualization.interface';
import {
  AddDeviceMenuComponent,
} from 'app/pages/instances/components/all-instances/instance-details/instance-devices/add-device-menu/add-device-menu.component';
import {
  InstanceDevicesComponent,
} from 'app/pages/instances/components/all-instances/instance-details/instance-devices/instance-devices.component';
import {
  DeviceActionsMenuComponent,
} from 'app/pages/instances/components/common/device-actions-menu/device-actions-menu.component';
import { VirtualizationDevicesStore } from 'app/pages/instances/stores/virtualization-devices.store';

describe('InstanceDevicesComponent', () => {
  let spectator: Spectator<InstanceDevicesComponent>;
  const devices = [
    {
      dev_type: VirtualizationDeviceType.Usb,
      description: 'USB Microphone',
    } as VirtualizationUsb,
    {
      dev_type: VirtualizationDeviceType.Gpu,
      description: 'Matrox G200eW',
    },
    {
      dev_type: VirtualizationDeviceType.Tpm,
    },
    {
      name: 'gpu1',
    } as VirtualizationProxy,
  ];

  const createComponent = createComponentFactory({
    component: InstanceDevicesComponent,
    imports: [
      NgxSkeletonLoaderComponent,
      MockComponents(
        DeviceActionsMenuComponent,
        AddDeviceMenuComponent,
      ),
    ],
    providers: [
      mockProvider(VirtualizationDevicesStore, {
        isLoading: () => false,
        selectedInstance: () => ({ id: 'my-instance' }),
        devices: () => devices,
        loadDevices: jest.fn(),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('shows a list of USB or GPU devices', () => {
    const deviceRows = spectator.queryAll('.device');

    expect(deviceRows).toHaveLength(3);
    expect(deviceRows[0]).toHaveText('USB Microphone');
    expect(deviceRows[1]).toHaveText('Matrox G200eW');
    expect(deviceRows[2]).toHaveText('Trusted Platform Module');
  });

  it('renders a menu to delete the device', () => {
    const actionsMenu = spectator.queryAll(DeviceActionsMenuComponent);
    expect(actionsMenu).toHaveLength(3);
    expect(actionsMenu[0].device).toBe(devices[0]);
  });

  it('renders a menu to add a new device', () => {
    const addMenu = spectator.query(AddDeviceMenuComponent);
    expect(addMenu).toExist();
  });
});
