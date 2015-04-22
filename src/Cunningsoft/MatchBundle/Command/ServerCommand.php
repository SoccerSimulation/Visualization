<?php

namespace Cunningsoft\MatchBundle\Command;

use Cunningsoft\MatchBundle\Services\Pusher;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\Wamp\WampServer;
use Ratchet\WebSocket\WsServer;
use React\EventLoop\Factory;
use React\Socket\Server;
use React\ZMQ\Context;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ServerCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('soccersim:server')
            ->setDescription('Start the server for user connections.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $loop = Factory::create();
        $pusher = new Pusher();

        $context = new Context($loop);

        $push = $context->getSocket(\ZMQ::SOCKET_PULL);
        $push->bind('tcp://127.0.0.1:5558');
        $push->on('message', array($pusher, 'onRender'));

        $webSock = new Server($loop);
        $webSock->listen(8080, '0.0.0.0');
        new IoServer(new HttpServer(new WsServer(new WampServer($pusher))), $webSock);

        $loop->run();
    }
}
