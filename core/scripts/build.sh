./scripts/build_linux.sh
./scripts/build_windows.sh
cp target/release/libcore.so ../lib/src/libraries/core.so
cp target/x86_64-pc-windows-msvc/release/core.dll ../lib/src/libraries/core.dll