Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run Chr(34) & WshShell.CurrentDirectory & "\tools\python312\pythonw.exe" & Chr(34) & " " & Chr(34) & WshShell.CurrentDirectory & "\desktop_gui.py" & Chr(34), 0
