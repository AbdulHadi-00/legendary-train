param($f, $old, $new) (Get-Content $f -Raw).Replace($old, $new) | Set-Content $f -NoNewline
