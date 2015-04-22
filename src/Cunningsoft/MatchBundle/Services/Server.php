<?php

namespace Cunningsoft\MatchBundle\Services;

use Cunningsoft\MatchBundle\SimpleSoccer\SimpleSoccer\SoccerPitch;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class Server implements MessageComponentInterface
{
    /**
     * @var ConnectionInterface[]
     */
    private $clients;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $connection)
    {
        $this->clients->attach($connection);
        echo 'new connection: ' . $connection->resourceId . "\n";
    }

    public function onMessage(ConnectionInterface $connection, $message)
    {
        $numberOfClients = count($this->clients) - 1;
        echo sprintf('connection %d sending message "%s" to %d other connection%s', $connection->resourceId, $message, $numberOfClients, $numberOfClients == 1 ? '' : 's') . "\n";

        foreach ($this->clients as $client) {
            if ($connection !== $client) {
                $client->send($message);
            }
        }
    }

    public function onClose(ConnectionInterface $connection)
    {
        $this->clients->detach($connection);
        echo 'connection ' . $connection->resourceId . ' has disconnected' . "\n";
    }

    public function onError(ConnectionInterface $connection, \Exception $e)
    {
        echo 'an error has occured: ' . $e->getMessage() . "\n";
        $connection->close();
    }
}
