use framework "IOBluetooth"
use scripting additions

on run argv
	set DeviceAddress to item 1 of argv
	set foundedDevice to ""

	repeat with device in (current application's IOBluetoothDevice's pairedDevices() as list)
		if (device's addressString as string) contains DeviceAddress then set foundedDevice to device
	end repeat

	if (foundedDevice's isConnected as boolean) then
		return "connected"
	else
		return "not-connected"
	end if
end run
