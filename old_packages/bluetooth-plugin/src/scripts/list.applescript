use framework "IOBluetooth"
use scripting additions

set devices to ""
repeat with device in (current application's IOBluetoothDevice's pairedDevices() as list)
  if (device's isConnected as boolean) then
		set connected to "connected"
	else
		set connected to "not-connected"
	end if
	set devices to devices & "\n" & device's nameOrAddress & "%%$$" & connected & "%%$$" & device's addressString
end repeat

return devices
